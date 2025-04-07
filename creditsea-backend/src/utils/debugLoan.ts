/**
 * Debug utility to inspect loan objects
 */

// Function to safely inspect loan objects and their ID properties
export const debugLoan = (loan: any, label = 'Loan'): void => {
  console.group(`Debug ${label}`);
  
  try {
    // Check if the loan exists
    if (!loan) {
      console.log(`${label} is ${loan} (${typeof loan})`);
      console.groupEnd();
      return;
    }
    
    // Log the loan's type
    console.log(`${label} Type:`, typeof loan);
    
    // If it's a string, just log it
    if (typeof loan === 'string') {
      console.log(`${label} Value (string):`, loan);
      console.groupEnd();
      return;
    }
    
    // Check for ID properties
    console.log(`Has '.id' property:`, Object.prototype.hasOwnProperty.call(loan, 'id'));
    console.log(`Has '._id' property:`, Object.prototype.hasOwnProperty.call(loan, '_id'));
    
    // Log the loan's ID values if they exist
    if (loan.id !== undefined) {
      console.log(`${label}.id =`, loan.id, `(${typeof loan.id})`);
    }
    
    if (loan._id !== undefined) {
      console.log(`${label}._id =`, loan._id, `(${typeof loan._id})`);
    }
    
    // Try to get all keys
    const keys = Object.keys(loan);
    console.log(`${label} Keys:`, keys);
    
    // Try to JSON stringify the loan
    try {
      const jsonStr = JSON.stringify(loan, null, 2);
      console.log(`${label} JSON:`, jsonStr);
    } catch (error) {
      console.error(`Cannot JSON stringify ${label}:`, error);
    }
    
    // If it's a MongoDB document, try to access its toObject method
    if (typeof loan.toObject === 'function') {
      console.log(`${label} is a Mongoose document`);
      try {
        const plainObj = loan.toObject();
        console.log(`${label} as plain object:`, plainObj);
      } catch (error) {
        console.error(`Error calling toObject() on ${label}:`, error);
      }
    }
    
  } catch (error) {
    console.error(`Error debugging ${label}:`, error);
  }
  
  console.groupEnd();
};

export default debugLoan;