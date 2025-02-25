import { app } from './app.ts';

const port = Deno.env.get('ENV') === 'production' ? 443 : 80;

app.listen(port, () => {
  console.log(`Server is listening for HTTP/S requests on port ${port}`);
});
