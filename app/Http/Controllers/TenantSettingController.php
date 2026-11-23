<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TenantSetting;
use Illuminate\Support\Facades\Storage;

class TenantSettingController extends Controller
{
    public function edit()
    {
        $tenantId = session('active_tenant_id');
        
        // Ambil pengaturan perusahaan, jika belum ada, buatkan data kosong (firstOrCreate)
        $settings = TenantSetting::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'company_name' => 'Perusahaan Saya',
                'theme_color' => '#2563eb',
                'invoice_footer' => 'Terima kasih atas kepercayaan Anda.'
            ]
        );

        return Inertia::render('settings/invoice-template', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $tenantId = session('active_tenant_id');
        $settings = TenantSetting::where('tenant_id', $tenantId)->firstOrFail();

        $request->validate([
            'company_name' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'company_phone' => 'nullable|string|max:50',
            'theme_color' => 'nullable|string|max:7',
            'invoice_footer' => 'nullable|string',
            'logo' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $data = $request->only(['company_name', 'company_address', 'company_phone', 'theme_color', 'invoice_footer']);

        // Handle Upload Logo
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        $settings->update($data);

        return redirect()->back()->with('success', 'Template Invoice berhasil diperbarui!');
    }
}