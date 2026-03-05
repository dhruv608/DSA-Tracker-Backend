import app from './app';
import { startSyncJob } from './jobs/sync.job';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
   startSyncJob(); 
});