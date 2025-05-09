// src/params/uuid.ts
import type { ParamMatcher } from '@sveltejs/kit';
import isUUID from 'validator/lib/isUUID'; // We already installed this

export const match: ParamMatcher = (param) => {
    return isUUID(param);
};