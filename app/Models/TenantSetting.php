<?php
namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class TenantSetting extends Model
{
    use Auditable;
    protected $fillable = [
        'tenant_id', 'company_name', 'company_address', 
        'company_phone', 'logo_path', 'theme_color', 'invoice_footer'
    ];
}