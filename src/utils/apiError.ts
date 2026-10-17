type AxiosLikeError = {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: { message?: string | string[] };
  };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as AxiosLikeError;
  const status = err.response?.status;
  const serverMessage = err.response?.data?.message;

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage;
  }
  if (Array.isArray(serverMessage) && serverMessage[0]) {
    return String(serverMessage[0]);
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'Сервер недоступен (ошибка шлюза). В Amvera проверьте delivery-backend: реплики 1/1 и логи запуска.';
  }

  if (
    err.code === 'ECONNABORTED'
    || err.message?.toLowerCase().includes('timeout')
  ) {
    return 'Сервер не ответил вовремя. Проверьте интернет и что бэкенд запущен в Amvera (Домены → HTTPS).';
  }

  if (!err.response || err.message === 'Network Error') {
    return 'Нет связи с сервером. Откройте в браузере: delivery-backend-alichan25.msk1.amvera.tech/api/health';
  }

  if (err.message?.trim()) {
    return err.message;
  }

  return fallback;
}
