// Simple debug utility for logging API requests and responses

export const debug = {
  log: (context: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][${context}] ${message}`);
    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  },
  
  request: (req: any, route: string) => {
    const { method, params, query, body, headers, user } = req;
    debug.log('REQUEST', `${method} ${route}`, {
      params,
      query,
      body,
      user: user ? { id: user._id, role: user.role } : null
    });
  },
  
  response: (status: number, data: any) => {
    debug.log('RESPONSE', `Status ${status}`, data);
  },
  
  error: (context: string, error: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}][ERROR][${context}]`, error);
  }
};

export default debug;