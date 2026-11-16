import app, { getNetworkIp } from './app.js';

const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
  const networkIp = getNetworkIp();
  console.log(`☕ Ever Coffee House Server running:`);
  console.log(`   ➜ Local Link:   http://localhost:${PORT}`);
  console.log(`   ➜ Wi-Fi Link:   http://${networkIp}:${PORT}`);
});
