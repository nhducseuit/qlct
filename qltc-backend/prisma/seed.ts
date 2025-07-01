
// Orchestrator: Run the correct seed script based on NODE_ENV
const env = process.env.NODE_ENV;
if (env === 'production') {
  console.log('Production environment detected. Running production seed...');
  require('./seed.prod');
} else {
  console.log('Development environment detected. Running development seed...');
  require('./seed.dev');
}
