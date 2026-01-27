"use client"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to merge Tailwind className strings safely
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
