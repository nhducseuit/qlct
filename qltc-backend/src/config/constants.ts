export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'DO_NOT_USE_THIS_IN_PRODUCTION_CHANGE_IT', // Use environment variable in production
};