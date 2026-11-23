<?php

namespace App\Http\Controllers;

use App\Models\DeliveryOrder;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = session('active_tenant_id');
        if (!$tenantId) {
            return redirect()->route('dashboard');
        }

        // 1. DAFTAR TAB LOG AKTIVITAS
        $availableTabs = [
            ['id' => 'DeliveryOrder', 'label' => 'Surat Jalan (DO)', 'model' => DeliveryOrder::class],
            ['id' => 'Invoice', 'label' => 'Faktur (Invoice)', 'model' => Invoice::class],
            ['id' => 'Product', 'label' => 'Produk', 'model' => Product::class],
            ['id' => 'PurchaseOrder', 'label' => 'Purchase Order', 'model' => PurchaseOrder::class],
            ['id' => 'SalesOrder', 'label' => 'Sales Order', 'model' => SalesOrder::class],
            ['id' => 'Karyawan', 'label' => 'Data Karyawan', 'model' => User::class],
            ['id' => 'User', 'label' => 'Aktivitas Pengguna', 'model' => User::class],
        ];

        $allAuditedModels = [
            DeliveryOrder::class,
            Invoice::class,
            Product::class,
            PurchaseOrder::class,
            SalesOrder::class,
            User::class,
        ];

        $requestedTab = $request->input('tab', 'DeliveryOrder');
        $activeTabDef = collect($availableTabs)->firstWhere('id', $requestedTab) ?? $availableTabs[0];
        $activeTabId = $activeTabDef['id'];
        $activeModel = $activeTabDef['model'];
        $activeLabel = $activeTabDef['label'];

        $query = Activity::with(['causer', 'subject'])->latest();

        if ($activeTabId === 'User') {
            $query->where('causer_type', User::class);
        } else {
            $query->where('subject_type', $activeModel);
        }

        // 2. ISOLASI TENANT (Mencegah Kebocoran Data Antar Perusahaan)
        $query->where(function ($q) use ($tenantId, $allAuditedModels, $activeTabId, $activeModel) {
            $modelsToCheck = $activeTabId === 'User' ? $allAuditedModels : [$activeModel];

            // Prioritas 1: Cocokkan tenant_id yang tersimpan di JSON properties
            $q->where('properties->tenant_id', $tenantId)
              ->orWhere('properties->attributes->tenant_id', $tenantId)
              ->orWhere('properties->old->tenant_id', $tenantId)
              // Prioritas 2 (Fallback log lama sebelum hook properties->tenant_id aktif)
              ->orWhere(function ($legacy) use ($tenantId, $modelsToCheck) {
                  $legacy->whereNull('properties->tenant_id')
                      ->whereNull('properties->attributes->tenant_id')
                      ->whereNull('properties->old->tenant_id')
                      ->whereHasMorph('subject', $modelsToCheck, function ($subjectQuery, $type) use ($tenantId) {
                          if (in_array(SoftDeletes::class, class_uses_recursive($subjectQuery->getModel()))) {
                              $subjectQuery->withTrashed();
                          }

                          if ($type === User::class) {
                              // Tabel users memakai relasi pivot many-to-many (tenants)
                              $subjectQuery->whereHas('tenants', function ($tenantQuery) use ($tenantId) {
                                  $tenantQuery->where('tenants.id', $tenantId);
                              });
                          } else {
                              $subjectQuery->where('tenant_id', $tenantId);
                          }
                      });
              });
        });

        $logs = $query->paginate(15)->withQueryString();

        // 3. PRE-FETCH USER UNTUK MENCEGAH N+1 QUERY
        $userIdsToFetch = [];
        $userRelatedColumns = ['approved_by_id', 'created_by', 'user_id', 'sales_person_id', 'sales_user_id'];

        foreach ($logs as $log) {
            $props = $log->properties;
            if (isset($props['attributes']) && is_array($props['attributes'])) {
                foreach ($props['attributes'] as $key => $val) {
                    if (in_array($key, $userRelatedColumns)) {
                        if ($val) {
                            $userIdsToFetch[] = $val;
                        }
                        if (!empty($props['old'][$key])) {
                            $userIdsToFetch[] = $props['old'][$key];
                        }
                    }
                }
            }
        }

        $userIdsToFetch = array_unique($userIdsToFetch);
        $userDictionary = empty($userIdsToFetch)
            ? []
            : User::whereIn('id', $userIdsToFetch)->pluck('name', 'id')->toArray();

        $resolveUserName = function ($id) use ($userDictionary) {
            if (!$id) {
                return '-';
            }
            return $userDictionary[$id] ?? "ID: {$id} (Dihapus)";
        };

        // 4. MESIN PENERJEMAH
        $logs->getCollection()->transform(function ($log) use ($resolveUserName, $activeLabel, $activeTabId) {
            $properties = $log->properties ? $log->properties->toArray() : [];
            $eventName = $log->event;

            $targetDocument = $activeLabel;
            if ($activeTabId === 'User' && $log->subject_type) {
                $targetDocument = $log->subject_type === User::class
                    ? 'Data Karyawan'
                    : Str::headline(class_basename($log->subject_type));
            }

            $actionText = "Melakukan tindakan pada {$targetDocument}";
            if ($eventName === 'created') {
                $actionText = "Membuat {$targetDocument} baru";
            } elseif ($eventName === 'updated') {
                $actionText = "Memperbarui data {$targetDocument}";
            } elseif ($eventName === 'deleted') {
                $actionText = "Menghapus {$targetDocument}";
            }

            $changeDetails = [];

            if (isset($properties['attributes']) && is_array($properties['attributes'])) {
                foreach ($properties['attributes'] as $key => $newValue) {
                    $oldValue = $properties['old'][$key] ?? null;

                    if (in_array($key, ['created_at', 'updated_at', 'deleted_at', 'tenant_id', 'password', 'remember_token'])) {
                        continue;
                    }

                    $readableKey = Str::headline($key);

                    if (str_ends_with($key, '_id')) {
                        $readableKey = Str::headline(str_replace('_id', '', $key));

                        $userRelatedColumns = ['approved_by_id', 'created_by', 'user_id', 'sales_person_id', 'sales_user_id'];
                        if (in_array($key, $userRelatedColumns)) {
                            $newValue = $resolveUserName($newValue);
                            $oldValue = $resolveUserName($oldValue);
                        }
                    }

                    if ($eventName === 'updated' && $oldValue !== $newValue) {
                        $oldValStr = is_array($oldValue) ? json_encode($oldValue) : ($oldValue ?: 'Kosong');
                        $newValStr = is_array($newValue) ? json_encode($newValue) : ($newValue ?: 'Kosong');
                        $changeDetails[] = "{$readableKey} diubah dari '{$oldValStr}' menjadi '{$newValStr}'";
                    } elseif ($eventName === 'created') {
                        $newValStr = is_array($newValue) ? json_encode($newValue) : ($newValue ?: '-');
                        if ($newValStr !== '-') {
                            $changeDetails[] = "{$readableKey} diisi '{$newValStr}'";
                        }
                    }
                }
            }

            $humanReadableMessage = $actionText;
            if (count($changeDetails) > 0) {
                $shownDetails = array_slice($changeDetails, 0, 3);
                $hiddenCount = count($changeDetails) - 3;

                $humanReadableMessage .= ': ' . implode(', ', $shownDetails);
                if ($hiddenCount > 0) {
                    $humanReadableMessage .= ", dan {$hiddenCount} kolom lainnya.";
                }
            } else {
                $humanReadableMessage .= '.';
            }

            $log->human_readable_message = $humanReadableMessage;

            return $log;
        });

        return Inertia::render('system-logs/index', [
            'logs' => $logs,
            'tabs' => $availableTabs,
            'activeTab' => $activeTabId,
        ]);
    }
}