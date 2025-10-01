// Input validation utilities
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateFileName(fileName: string): boolean {
  // Check for dangerous file extensions and patterns
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  return !dangerousExtensions.includes(extension) && 
         fileName.length < 255 &&
         !fileName.includes('..') &&
         !fileName.includes('/') &&
         !fileName.includes('\\');
}

export function validateFileSize(size: number, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

export function validateFileType(type: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm'
  ];
  return allowedTypes.includes(type);
}
