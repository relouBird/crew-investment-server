export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function GenerateEmail(otp: string, reset: boolean, isOnline?: boolean) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .email-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            padding: 25px 30px;
            text-align: center;
            color: white;
        }

        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .email-header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .email-body {
            padding: 25px 30px;
            text-align: center;
        }

        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            font-weight: 500;
        }

        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 35px;
            line-height: 1.6;
        }

        .otp-container {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px dashed #cbd5e1;
            border-radius: 16px;
            padding: 30px;
            margin: 20px 0;
            position: relative;
        }

        .otp-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }

        .otp-validity {
            font-size: 14px;
            color: #ef4444;
            font-weight: 500;
            margin-top: 15px;
        }

        .security-warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
        }

        .security-warning .warning-icon {
            color: #f59e0b;
            font-size: 20px;
            margin-right: 10px;
        }

        .security-warning .warning-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }

        .security-warning .warning-text {
            font-size: 14px;
            color: #92400e;
            margin: 0;
        }

        .support-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            /* margin: 30px 0; */
            text-align: center;
        }

        .support-section h3 {
            font-size: 16px;
            color: #334155;
            margin-bottom: 10px;
        }

        .support-section p {
            font-size: 14px;
            color: #64748b;
            margin: 5px 0;
        }

        .support-section a {
            color: #1e3a8a;
            text-decoration: none;
            font-weight: 500;
        }

        .support-section a:hover {
            text-decoration: underline;
        }

        .email-footer {
            background: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .email-footer p {
            font-size: 12px;
            color: #64748b;
            margin: 5px 0;
        }

        .email-footer a {
            color: #1e3a8a;
            text-decoration: none;
        }

        .copy-button {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.2s;
        }

        .copy-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                <img src="${isOnline ? "https://anoybggdqpxdfcfhxfsg.supabase.co/storage/v1/object/public/investia//logo.png" : "http://127.0.0.1:54321/storage/v1/object/public/investia//logo.png"}" alt="Logo">
            </div>
            <h1>Code de vérification</h1>
            <p>Authentification sécurisée</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">
                Bonjour,
            </div>

            <div class="message">
                Vous avez demandé un code de vérification pour ${
                  reset
                    ? "réinitialiser votre mot de passe."
                    : "accéder à votre compte."
                }<br>
                Voici votre code de vérification à usage unique :
            </div>

            <div class="otp-container">
                <div class="otp-label">Votre code OTP</div>
                <div class="otp-code" id="otpCode">${otp}</div>
                <div class="otp-validity">⏱️ Valide pendant 10 minutes</div>
                <button class="copy-button" onclick="copyOTP()">
                    📋 Copier le code
                </button>
            </div>

            <div class="security-warning">
                <div class="warning-title">
                    <span class="warning-icon">⚠️</span>
                    Important - Sécurité
                </div>
                <div class="warning-text">
                    • Ne partagez jamais ce code avec quiconque<br>
                    • Notre équipe ne vous demandera jamais ce code<br>
                    • Si vous n'avez pas demandé ce code, ignorez cet email
                </div>
            </div>

            <div class="support-section">
                <h3>Besoin d'aide ?</h3>
                <p>Si vous rencontrez des difficultés, contactez notre support :</p>
                <p><a href="mailto:support@votreapp.com">support@investia.com</a></p>
                <p>Ou visitez notre <a href="#">centre d'aide</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p><strong>Invest IA</strong> - Plateforme sécurisée</p>
            <p>© 2025 InvestIA. Tous droits réservés.</p>
            <p>
                <a href="#">Politique de confidentialité</a> | 
                <a href="#">Conditions d'utilisation</a> | 
                <a href="#">Se désabonner</a>
            </p>
        </div>
    </div>

    <script>
        function copyOTP() {
            const otpCode = document.getElementById('otpCode').textContent;
            navigator.clipboard.writeText(otpCode).then(() => {
                const button = document.querySelector('.copy-button');
                const originalText = button.textContent;
                button.textContent = '✓ Copié !';
                button.style.background = '#22c55e';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
                }, 2000);
            }).catch(() => {
                alert('Code: ' + otpCode);
            });
        }
    </script>
</body>
</html>`;
}

export function GenerateThanksEmail(
  funds: number,
  transaction_id: string,
  isOnline?: boolean
) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .email-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            padding: 25px 30px;
            text-align: center;
            color: white;
        }

        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .email-header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .email-body {
            padding: 25px 30px;
            text-align: center;
        }

        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            font-weight: 500;
        }

        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 35px;
            line-height: 1.6;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }

        .support-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            /* margin: 30px 0; */
            text-align: center;
        }

        .support-section h3 {
            font-size: 16px;
            color: #334155;
            margin-bottom: 10px;
        }

        .support-section p {
            font-size: 14px;
            color: #64748b;
            margin: 5px 0;
        }

        .support-section a {
            color: #1e3a8a;
            text-decoration: none;
            font-weight: 500;
        }

        .support-section a:hover {
            text-decoration: underline;
        }

        .email-footer {
            background: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .email-footer p {
            font-size: 12px;
            color: #64748b;
            margin: 5px 0;
        }

        .email-footer a {
            color: #1e3a8a;
            text-decoration: none;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                <img src="${isOnline ? "https://anoybggdqpxdfcfhxfsg.supabase.co/storage/v1/object/public/investia//logo.png" : "http://127.0.0.1:54321/storage/v1/object/public/investia//logo.png"}" alt="Logo">
            </div>
            <h1>Recharge Effectué</h1>
            <p>TR-ID-${transaction_id}</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">
                Bonjour,
            </div>

            <div class="message">
                Merci d'avoir effectué une recharge au sein de notre plateforme.<br>
                Votre recharge est de :
            </div>

            
            <div class="otp-code" id="otpCode">${funds}&#x244;</div>

            <div class="support-section">
                <h3>Besoin d'aide ?</h3>
                <p>Si vous rencontrez des difficultés, contactez notre support :</p>
                <p><a href="mailto:support@votreapp.com">support@investia.com</a></p>
                <p>Ou visitez notre <a href="#">centre d'aide</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p><strong>Invest IA</strong> - Plateforme sécurisée</p>
            <p>© 2025 InvestIA. Tous droits réservés.</p>
            <p>
                <a href="#">Politique de confidentialité</a> | 
                <a href="#">Conditions d'utilisation</a> | 
                <a href="#">Se désabonner</a>
            </p>
        </div>
    </div>

    <script>
        function copyOTP() {
            const otpCode = document.getElementById('otpCode').textContent;
            navigator.clipboard.writeText(otpCode).then(() => {
                const button = document.querySelector('.copy-button');
                const originalText = button.textContent;
                button.textContent = '✓ Copié !';
                button.style.background = '#22c55e';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
                }, 2000);
            }).catch(() => {
                alert('Code: ' + otpCode);
            });
        }
    </script>
</body>
</html>`;
}

export function GenerateFailEmail(
  transaction_id: string,
  isOnline?: boolean
) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .email-header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            padding: 25px 30px;
            text-align: center;
            color: white;
        }

        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .email-header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .email-body {
            padding: 25px 30px;
            text-align: center;
        }

        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            font-weight: 500;
        }

        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 35px;
            line-height: 1.6;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #ef4444;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: #ef4444;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }

        .support-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            /* margin: 30px 0; */
            text-align: center;
        }

        .support-section h3 {
            font-size: 16px;
            color: #334155;
            margin-bottom: 10px;
        }

        .support-section p {
            font-size: 14px;
            color: #64748b;
            margin: 5px 0;
        }

        .support-section a {
            color: #1e3a8a;
            text-decoration: none;
            font-weight: 500;
        }

        .support-section a:hover {
            text-decoration: underline;
        }

        .email-footer {
            background: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .email-footer p {
            font-size: 12px;
            color: #64748b;
            margin: 5px 0;
        }

        .email-footer a {
            color: #1e3a8a;
            text-decoration: none;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                <img src="${isOnline ? "https://anoybggdqpxdfcfhxfsg.supabase.co/storage/v1/object/public/investia//logo.png" : "http://127.0.0.1:54321/storage/v1/object/public/investia//logo.png"}" alt="Logo">
            </div>
            <h1>Echec Recharge</h1>
            <p>TR-ID-${transaction_id}</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">
                Bonjour,
            </div>

            <div class="message">
                Desolé nous avons rencontré un soucis desolé, mais votre recharge n'a pas pu etre effectué<br>
            </div>

            
            <div class="otp-code" id="otpCode">❌ ECHEC</div>

            <div class="support-section">
                <h3>Besoin d'aide ?</h3>
                <p>Si vous rencontrez des difficultés, contactez notre support :</p>
                <p><a href="mailto:support@votreapp.com">support@investia.com</a></p>
                <p>Ou visitez notre <a href="#">centre d'aide</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p><strong>Invest IA</strong> - Plateforme sécurisée</p>
            <p>© 2025 InvestIA. Tous droits réservés.</p>
            <p>
                <a href="#">Politique de confidentialité</a> | 
                <a href="#">Conditions d'utilisation</a> | 
                <a href="#">Se désabonner</a>
            </p>
        </div>
    </div>

    <script>
        function copyOTP() {
            const otpCode = document.getElementById('otpCode').textContent;
            navigator.clipboard.writeText(otpCode).then(() => {
                const button = document.querySelector('.copy-button');
                const originalText = button.textContent;
                button.textContent = '✓ Copié !';
                button.style.background = '#22c55e';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
                }, 2000);
            }).catch(() => {
                alert('Code: ' + otpCode);
            });
        }
    </script>
</body>
</html>`;
}