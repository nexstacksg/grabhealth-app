export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Check if user is admin
  if (user.role?.type === 'admin' || user.role?.name === 'ADMIN') {
    return true;
  }

  // For user summary endpoint, check if requesting own data
  if (policyContext.request.path.includes('/commissions/user/')) {
    const requestedUserId = parseInt(policyContext.params.userId);
    return user.id === requestedUserId;
  }

  // For approve and mark-paid endpoints, only admins allowed
  if (policyContext.request.path.includes('/approve') || 
      policyContext.request.path.includes('/mark-paid')) {
    return false;
  }

  return false;
};