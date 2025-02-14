import { app } from './app.ts';

console.log(Deno.env.get('DATABASE_URL'));

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
