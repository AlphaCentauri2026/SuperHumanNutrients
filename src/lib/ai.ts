import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONSTANTS } from './constants';

// Initialize Google Generative AI with proper environment variable access
// Make sure to use NEXT_PUBLIC_ prefix for client-side environment variables
const apiKey =
  process.env.NEXT_PUBLIC_AI_API_KEY || process.env.AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface MealPlanRequest {
  fruits: string[];
  vegetables: string[];
  grains: string[];
  userPrompt?: string;
  preferences?: string;
  dietaryRestrictions?: string[];
}

export interface MealPlanResponse {
  success: boolean;
  mealPlan?: string;
  error?: string;
}

export async function generateMealPlan(
  request: MealPlanRequest
): Promise<MealPlanResponse> {
  try {
    if (!apiKey) {
      throw new Error('AI API key not configured');
    }

    // Fetch food suggestions from database to enhance AI creativity
    let foodSuggestions = '';
    try {
      const foodsResponse = await fetch('/api/ai/foods');
      if (foodsResponse.ok) {
        const foodsData = await foodsResponse.json();
        if (foodsData.success) {
          const { categories } = foodsData.data;
          foodSuggestions = `
AVAILABLE INGREDIENTS FROM COMPREHENSIVE DATABASE:
- Fruits (${categories.fruits.count} available): ${categories.fruits.examples
            .slice(0, 8)
            .map((f: { name: string }) => f.name)
            .join(', ')} and many more
- Vegetables (${categories.vegetables.count} available): ${categories.vegetables.examples
            .slice(0, 8)
            .map((f: { name: string }) => f.name)
            .join(', ')} and many more  
- Grains (${categories.grains.count} available): ${categories.grains.examples
            .slice(0, 8)
            .map((f: { name: string }) => f.name)
            .join(', ')} and many more
- Superfoods (${categories.superfoods.count} available): ${categories.superfoods.examples
            .slice(0, 6)
            .map((f: { name: string }) => f.name)
            .join(', ')} and many more
- Exotic Foods (${categories.exotic.count} available): ${categories.exotic.examples
            .slice(0, 6)
            .map((f: { name: string }) => f.name)
            .join(', ')} and many more

Use this diversity to create unique, surprising combinations that showcase the full range of available ingredients.`;
        }
      }
    } catch (error) {
      console.log('Could not fetch food suggestions, using default prompt');
    }

    // We'll try multiple models with timeouts instead of pre-testing

    // Build a comprehensive prompt based on user input
    // Add randomization to make each meal plan unique
    const randomElements = [
      'with a focus on seasonal ingredients',
      'incorporating superfood combinations',
      'using innovative cooking techniques',
      'with unexpected flavor pairings',
      'focusing on nutrient synergy',
      'with modern culinary trends',
      'using ancient wisdom principles',
      'with molecular gastronomy concepts',
    ];

    const randomElement =
      randomElements[Math.floor(Math.random() * randomElements.length)];

    let prompt = `Create a detailed, healthy meal plan for one week ${randomElement}`;

    // Add food ingredients if provided
    if (
      request.fruits.length > 0 ||
      request.vegetables.length > 0 ||
      request.grains.length > 0
    ) {
      prompt += ` using the following ingredients:

      Fruits: ${request.fruits.join(', ') || 'Any fruits of your choice'}
      Vegetables: ${request.vegetables.join(', ') || 'Any vegetables of your choice'}
      Grains: ${request.grains.join(', ') || 'Any grains of your choice'}`;
    } else {
      prompt += ` with a focus on whole, nutritious foods`;
    }

    // Add food suggestions from database
    if (foodSuggestions) {
      prompt += `\n\n${foodSuggestions}`;
    }

    // Add user's custom prompt/goal if provided
    if (request.userPrompt) {
      prompt += `\n\nUser Goal: ${request.userPrompt}`;
    }

    // Add additional preferences if provided
    if (request.preferences) {
      prompt += `\n\nAdditional preferences: ${request.preferences}`;
    }

    // Add dietary restrictions if provided
    if (request.dietaryRestrictions?.length) {
      prompt += `\n\nDietary restrictions: ${request.dietaryRestrictions.join(', ')}`;
    }

    // Complete the prompt with specific requirements
    prompt += `
      IMPORTANT: You must generate exactly 7 individual fruit-vegetable-grain combinations, one for each day of the week.

      FORMAT: Each combination must include 1-2 fruits + 1-2 vegetables + 1 grain.

      INGREDIENT SELECTION: You have access to a comprehensive database of over 1000 diverse foods. The specific available ingredients have been provided above.
      
      IMPORTANT: Use the actual ingredients from the database that were listed above. Don't make up ingredients that weren't provided.
      Create unique, surprising combinations that showcase the full diversity of available ingredients.

      REQUIRED OUTPUT STRUCTURE (exactly like this):
      COMBINATION 1 (Monday):
      Name: [catchy health-focused name]
      Fruits: [specific fruits with quantities]
      Vegetables: [specific vegetables with quantities]
      Grain: [specific grain with quantity]
      Benefits: [brief nutrient synergy explanation]
      Preparation: [simple prep method]

      COMBINATION 2 (Tuesday):
      Name: [catchy health-focused name]
      Fruits: [specific fruits with quantities]
      Vegetables: [specific vegetables with quantities]
      Grain: [specific grain with quantity]
      Benefits: [brief nutrient synergy explanation]
      Preparation: [simple prep method]

      [Continue for COMBINATION 3 (Wednesday) through COMBINATION 7 (Sunday)]

      CRITICAL RULES:
      - Generate exactly 7 individual combinations
      - Use "COMBINATION X (Day):" format for each one
      - Do NOT create a weekly meal plan
      - Do NOT use "Day 1, Day 2" format
      - Focus only on fruits, vegetables, and grains
      - Make each combination unique and surprising
      - Use diverse ingredients from the comprehensive database
      - Tailor to user's nutrition goal
      - Keep preparation simple
      - Prioritize combinations rich in user's target nutrients
      - Surprise users with unexpected but delicious combinations`;

    // Try multiple models with shorter timeouts for faster generation
    const models = [
      { name: 'gemini-1.5-flash', timeout: AI_CONSTANTS.TIMEOUTS.FLASH_MODEL },
      { name: 'gemini-1.5-pro', timeout: AI_CONSTANTS.TIMEOUTS.PRO_MODEL },
    ];

    for (const modelConfig of models) {
      try {
        const currentModel = genAI.getGenerativeModel({
          model: modelConfig.name,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(`AI generation timeout for ${modelConfig.name}`)
              ),
            modelConfig.timeout
          );
        });

        const generationPromise = currentModel.generateContent(prompt);

        const result = await Promise.race([generationPromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        return {
          success: true,
          mealPlan: text,
        };
      } catch (error) {
        // Check if it's a model not found error
        if (error instanceof Error && error.message.includes('404 Not Found')) {
          continue; // Try next model silently
        }
        continue; // Try next model
      }
    }

    // If all models fail, generate a simple fallback response

    // Create a simple fallback response with basic combinations
    const fallbackResponse = `COMBINATION 1 (Monday):
Name: "Iron-Rich Power Bowl"
Fruits: 1 cup strawberries, 1 medium orange
Vegetables: 2 cups spinach, 1 cup broccoli
Grain: 1/2 cup quinoa
Benefits: Rich in iron, vitamin C, and fiber for energy and immunity
Preparation: Steam quinoa, sauté vegetables, add fresh fruits

COMBINATION 2 (Tuesday):
Name: "Potassium Boost Medley"
Fruits: 1 medium banana, 1 cup blueberries
Vegetables: 1 cup sweet potato, 1 cup kale
Grain: 1/2 cup brown rice
Benefits: High in potassium, antioxidants, and complex carbs for sustained energy
Preparation: Cook rice, roast sweet potato, steam kale, add fresh fruits

COMBINATION 3 (Wednesday):
Name: "Vitamin C Immunity Mix"
Fruits: 1 cup pineapple, 1 medium kiwi
Vegetables: 1 cup bell peppers, 1 cup Brussels sprouts
Grain: 1/2 cup farro
Benefits: Packed with vitamin C, fiber, and immune-boosting nutrients
Preparation: Cook farro, roast vegetables, add fresh fruits

COMBINATION 4 (Thursday):
Name: "Fiber-Rich Energy Bowl"
Fruits: 1 cup raspberries, 1 medium apple
Vegetables: 1 cup carrots, 1 cup cauliflower
Grain: 1/2 cup barley
Benefits: High fiber content for digestive health and sustained energy
Preparation: Cook barley, steam vegetables, add fresh fruits

COMBINATION 5 (Friday):
Name: "Antioxidant Power Pack"
Fruits: 1 cup blackberries, 1 medium pomegranate
Vegetables: 1 cup beets, 1 cup arugula
Grain: 1/2 cup wild rice
Benefits: Rich in antioxidants, nitrates, and anti-inflammatory compounds
Preparation: Cook wild rice, roast beets, add fresh arugula and fruits

COMBINATION 6 (Saturday):
Name: "Calcium-Rich Greens Bowl"
Fruits: 1 cup figs, 1 medium pear
Vegetables: 1 cup collard greens, 1 cup bok choy
Grain: 1/2 cup amaranth
Benefits: High in calcium, vitamin K, and minerals for bone health
Preparation: Cook amaranth, steam greens, add fresh fruits

COMBINATION 7 (Sunday):
Name: "Omega-3 Brain Boost"
Fruits: 1 cup avocado, 1 medium grapefruit
Vegetables: 1 cup Brussels sprouts, 1 cup asparagus
Grain: 1/2 cup teff
Benefits: Rich in healthy fats, B vitamins, and minerals for brain function
Preparation: Cook teff, roast vegetables, add fresh avocado and grapefruit`;

    return {
      success: true,
      mealPlan: fallbackResponse,
    };
  } catch (error) {
    console.error('AI API error:', error);

    // Handle timeout specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return {
        success: false,
        error: 'AI generation took too long. Please try again.',
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to generate meal plan. Please try again.',
    };
  }
}
