import { app } from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`Servidor em http://localhost:${config.port}`);
});