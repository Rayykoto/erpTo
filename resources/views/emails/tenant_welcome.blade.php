<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang di {{ config('app.name') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5; color: #3f3f46; line-height: 1.6;">
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Main Card -->
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    
                    <!-- Header (Merah) -->
                    <tr>
                        <td align="center" style="background-color: #dc2626; padding: 40px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Selamat Datang!</h1>
                            <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px;">Workspace Anda telah siap digunakan.</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #18181b;">Halo, {{ $tenantData['pic_name'] }}!</h2>
                            <p style="margin: 0 0 20px 0; color: #52525b; font-size: 16px;">
                                Terima kasih telah bergabung dengan <strong>{{ config('app.name') }}</strong>. Workspace eksklusif untuk <strong>{{ $tenantData['company_name'] }}</strong> telah berhasil kami buat dan siap untuk digunakan.
                            </p>
                            
                            <!-- Call to Action Button -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $tenantData['login_url'] }}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);">
                                            Login ke Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px; text-align: center;">Atau salin tautan berikut ke browser Anda:</p>
                            <p style="margin: 0 0 30px 0; text-align: center; word-break: break-all;">
                                <a href="{{ $tenantData['login_url'] }}" style="color: #ef4444; font-size: 14px; text-decoration: underline;">{{ $tenantData['login_url'] }}</a>
                            </p>
                            
                            <!-- Account Info Box -->
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 16px; font-weight: 600;">Informasi Akun Anda:</h3>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="80" style="padding: 4px 0; color: #7f1d1d; font-size: 15px; font-weight: 600;">Email</td>
                                        <td style="padding: 4px 0; color: #3f3f46; font-size: 15px;">: {{ $tenantData['email'] }}</td>
                                    </tr>
                                    <tr>
                                        <td width="80" style="padding: 4px 0; color: #7f1d1d; font-size: 15px; font-weight: 600;">Password</td>
                                        <td style="padding: 4px 0; color: #18181b; font-size: 15px; font-weight: 700;">: {{ $tenantData['password'] }}</td>
                                    </tr>
                                </table>
                                <p style="margin: 12px 0 0 0; color: #b91c1c; font-size: 13px; font-style: italic;">
                                    *Harap segera ubah password ini melalui menu pengaturan setelah Anda berhasil login.
                                </p>
                            </div>
                            
                            <p style="margin: 0; color: #52525b; font-size: 15px;">
                                Salam hangat,<br>
                                <strong style="color: #18181b;">Tim {{ config('app.name') }}</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #fafafa; padding: 24px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.<br>
                                Email ini dikirimkan secara otomatis, mohon tidak membalas ke alamat email ini.
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>