export const subscribeCall = (data: { email: string }) =>
  fetch('https://api.mhkl.io/api/newsletter/subscribe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    const data = await res.json();
    if (data.error && data.error !== '') {
      throw new Error(data.error);
    }
  });
