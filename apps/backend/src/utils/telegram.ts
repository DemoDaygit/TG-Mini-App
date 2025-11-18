import crypto from 'crypto';

/**
 * Validates Telegram WebApp init data
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    urlParams.delete('hash');

    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return false;
  }
}

/**
 * Parses Telegram init data to extract user info
 */
export function parseTelegramInitData(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userParam = urlParams.get('user');

  if (!userParam) {
    throw new Error('No user data in init data');
  }

  const user = JSON.parse(decodeURIComponent(userParam));

  return {
    telegramId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    languageCode: user.language_code,
    isPremium: user.is_premium || false,
    authDate: urlParams.get('auth_date'),
    hash: urlParams.get('hash')
  };
}
