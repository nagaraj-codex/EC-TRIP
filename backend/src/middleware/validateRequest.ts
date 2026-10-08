import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export function validateRequest(schema: ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          const field = issue.path[0] ? String(issue.path[0]) : '_global';
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        return res.status(400).json({
          success: false,
          error: error.issues[0]?.message || 'Validation error',
          errors: fieldErrors,
        });
      }
      next(error);
    }
  };
}
