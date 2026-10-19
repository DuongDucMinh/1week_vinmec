import { existsSync } from 'node:fs';
import { Repository } from './repository';
import { createApp } from './app';
if(existsSync('.env'))process.loadEnvFile('.env');
const repository=new Repository(process.env.DATABASE_PATH||'data/local-demo.sqlite');
const {app,closeStreams}=createApp(repository);
const host=process.env.HOST||'127.0.0.1';const port=Number(process.env.PORT||3001);
const server=app.listen(port,host,()=>console.log(`Demo server: http://${host}:${port} (synthetic data only)`));
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{closeStreams();server.close(()=>{repository.close();process.exit(0);});});
