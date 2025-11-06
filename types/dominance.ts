/**
 * Dominance Dossier Type Definitions
 * Strict schema matching the Athena Engine output
 */

export type MarketingAngleType = "Urgency" | "Authority" | "Social Proof";

export interface MarketingAngle {
	angleType: MarketingAngleType;
	headline: string; // Max 10 words
	hook: string; // 3 sentences
}

export interface ProductConcept {
	productType: string;
	productName: string;
	productDescription: string;
	coreCurriculumOutline?: string[]; // 5 items for knowledge products
	coreFeatureSet?: string[]; // 5 items for software products
	marketingAngles?: MarketingAngle[]; // Only on first concept (3 angles)
}

export interface TrendAnalysis {
	corePsychologicalDriver: string;
	competitiveFlaw: string;
	superiorityVector: string;
}

export interface DominanceDossier {
	trendAnalysis: TrendAnalysis;
	productConcepts: ProductConcept[]; // Exactly 3 concepts
	generatedAt?: string;
	trend?: any;
	goal?: string;
	productType?: string;
	agent?: string;
}

/**
 * Validation function to check if a DominanceDossier is valid
 */
export function validateDominanceDossier(data: any): data is DominanceDossier {
	if (!data || typeof data !== 'object') {
		return false;
	}

	// Check trendAnalysis
	if (!data.trendAnalysis || typeof data.trendAnalysis !== 'object') {
		return false;
	}
	if (!data.trendAnalysis.corePsychologicalDriver || 
		!data.trendAnalysis.competitiveFlaw || 
		!data.trendAnalysis.superiorityVector) {
		return false;
	}

	// Check productConcepts array
	if (!Array.isArray(data.productConcepts) || data.productConcepts.length !== 3) {
		return false;
	}

	// Validate each concept
	for (const concept of data.productConcepts) {
		if (!concept.productType || !concept.productName || !concept.productDescription) {
			return false;
		}
		if (!concept.coreCurriculumOutline && !concept.coreFeatureSet) {
			return false;
		}
		
		// First concept should have marketingAngles (but don't fail if missing - we'll show empty state)
		if (data.productConcepts.indexOf(concept) === 0) {
			if (concept.marketingAngles !== undefined) {
				// If marketingAngles exists, validate it's an array with valid items
				if (!Array.isArray(concept.marketingAngles)) {
					return false; // If it exists but isn't an array, that's an error
				}
				// Validate each angle if they exist
				for (const angle of concept.marketingAngles) {
					if (!angle.angleType || !angle.headline || !angle.hook) {
						return false;
					}
				}
			}
			// If marketingAngles is undefined, that's OK - we'll show empty state
		}
	}

	return true;
}

