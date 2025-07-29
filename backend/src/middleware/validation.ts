import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Authentication validation
export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Last name must be 1-50 characters')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Game validation
export const validateCreateGame: ValidationChain[] = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Game title must be 1-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Description must be max 500 characters'),
  body('locationId')
    .isUUID()
    .withMessage('Valid location ID is required'),
  body('scheduledAt')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    })
    .withMessage('Valid future date is required'),
  body('maxPlayers')
    .isInt({ min: 2, max: 50 })
    .withMessage('Max players must be between 2 and 50'),
  body('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'any'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or any'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('gameType')
    .optional()
    .isIn(['pickup', 'tournament', 'scrimmage'])
    .withMessage('Game type must be pickup, tournament, or scrimmage')
];

export const validateUpdateGame: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Valid game ID is required'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Game title must be 1-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Description must be max 500 characters'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    })
    .withMessage('Valid future date is required'),
  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('Max players must be between 2 and 50'),
  body('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'any'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or any')
];

// Location validation
export const validateCreateLocation: ValidationChain[] = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Location name must be 1-100 characters'),
  body('address')
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape()
    .withMessage('Address must be 1-200 characters'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Description must be max 500 characters'),
  body('courtType')
    .optional()
    .isIn(['indoor', 'outdoor', 'hybrid'])
    .withMessage('Court type must be indoor, outdoor, or hybrid'),
  body('surfaceType')
    .optional()
    .isIn(['hardwood', 'asphalt', 'concrete', 'rubber'])
    .withMessage('Surface type must be hardwood, asphalt, concrete, or rubber'),
  body('hoopCount')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Hoop count must be between 1 and 20'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('amenities.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Each amenity must be 1-50 characters')
];

export const validateUpdateLocation: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Valid location ID is required'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Location name must be 1-100 characters'),
  body('address')
    .optional()
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape()
    .withMessage('Address must be 1-200 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Description must be max 500 characters')
];

// User profile validation
export const validateUpdateProfile: ValidationChain[] = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Last name must be 1-50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Bio must be max 500 characters'),
  body('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Skill level must be beginner, intermediate, or advanced'),
  body('preferredPosition')
    .optional()
    .isIn(['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center', 'any'])
    .withMessage('Preferred position must be a valid basketball position'),
  body('locationRadius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Location radius must be between 1 and 100 km')
];

// Query parameter validation
export const validateNearbyGames: ValidationChain[] = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km')
];

export const validateGameFilters: ValidationChain[] = [
  query('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'any'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or any'),
  query('locationId')
    .optional()
    .isUUID()
    .withMessage('Location ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['scheduled', 'starting', 'active', 'completed', 'cancelled'])
    .withMessage('Status must be a valid game status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// UUID parameter validation
export const validateUUIDParam = (paramName: string): ValidationChain => {
  return param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`);
};