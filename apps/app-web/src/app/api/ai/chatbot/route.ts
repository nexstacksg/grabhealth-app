import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openaiModel, SYSTEM_PROMPT } from '@/lib/openai';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { partnerService } from '@/services/unified-partner.service';

interface ChatbotRequest {
  message: string;
  context?: {
    productId?: string;
    categoryId?: string;
    orderId?: string;
  };
}

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  products?: any[];
  partners?: any[];
  actions?: {
    type: string;
    payload: Record<string, unknown>;
  }[];
}

// Cache categories for performance
let categoriesCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCategories() {
  const now = Date.now();
  if (!categoriesCache || now - cacheTimestamp > CACHE_DURATION) {
    try {
      categoriesCache = await categoryService.getCategories();
      cacheTimestamp = now;
    } catch (error) {
      console.error('Error fetching categories:', error);
      categoriesCache = [];
    }
  }
  return categoriesCache;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatbotRequest = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get actual categories from Strapi
    const categories = await getCategories();
    const categoryNames = categories.map(cat => cat.name.toLowerCase());
    const categorySlugs = categories.map(cat => cat.slug);

    // Build context-aware prompt
    let contextPrompt = '';
    if (context) {
      if (context.productId) {
        contextPrompt += `\nThe user is currently viewing product ID: ${context.productId}.`;
      }
      if (context.categoryId) {
        contextPrompt += `\nThe user is browsing category ID: ${context.categoryId}.`;
      }
      if (context.orderId) {
        contextPrompt += `\nThe user is asking about order ID: ${context.orderId}.`;
      }
    }

    // Dynamic detection based on actual data
    const isAskingForRecommendations = /recommend|suggest|find|looking for|need|want|search|show|what|which|help/i.test(message);
    
    // Enhanced symptom detection with context awareness
    const isReportingSymptoms = /i have|i'm having|i feel|i am feeling|experiencing|suffering from|got a|have been having/i.test(message);
    
    const symptoms = {
      pain: /headache|migraine|pain|ache|hurt|sore/i.test(message) && isReportingSymptoms,
      fever: /fever|temperature|hot|burning/i.test(message) && isReportingSymptoms,
      cold: /cold|flu|cough|sneeze|runny nose|congestion/i.test(message) && isReportingSymptoms,
      fatigue: /fatigue|tired|exhausted|weak|no energy/i.test(message) && isReportingSymptoms,
      stress: /stress|anxiety|worried|nervous|tense/i.test(message) && isReportingSymptoms,
      sleep: /sleep|insomnia|can't sleep|restless/i.test(message) && isReportingSymptoms,
      stomach: /stomach|nausea|vomit|diarrhea|constipation|digest/i.test(message) && isReportingSymptoms,
      allergy: /allergy|allergic|rash|itch/i.test(message) && isReportingSymptoms,
      general: /ill|sick|unwell|not feeling well/i.test(message)
    };
    
    // Wellness product detection
    const isAskingAboutWellness = /vitamin|supplement|mineral|omega|probiotic|collagen|antioxidant|immunity|immune|wellness|health product/i.test(message) && !isReportingSymptoms;
    
    // Healthcare partner/clinic detection - enhanced to catch more variations
    const isAskingAboutPartners = /partner|clinic|healthcare|hospital|doctor|consultation|medical center|where are|location|chinese medicine|tcm|traditional|acupuncture|therapy|rehab|physiotherapy|checkup|check up/i.test(message);
    
    console.log('Message:', message);
    console.log('isAskingAboutPartners:', isAskingAboutPartners);
    
    // Check if asking for specific clinic type
    const clinicTypeMatch = message.match(/(?:chinese medicine|tcm|traditional|acupuncture|physiotherapy|sports|rehab|consultation|therapy|checkup|general)\s*(?:clinic|center|partner|doctor)?/i);
    const specificClinicType = clinicTypeMatch ? clinicTypeMatch[0] : null;
    
    const hasSymptoms = Object.values(symptoms).some(test => test);
    const mentionsSpecificNeed = hasSymptoms || isAskingAboutWellness;
    
    // Check if message mentions any actual category
    const lowerMessage = message.toLowerCase();
    const mentionedCategory = categories.find(cat => 
      lowerMessage.includes(cat.name.toLowerCase()) || 
      (cat.slug && lowerMessage.includes(cat.slug))
    );

    // Prepare response
    const response: ChatbotResponse = {
      message: '',
      suggestions: [],
      products: [],
      partners: [],
    };

    // If asking for specific health needs or categories, fetch relevant products
    // BUT skip product search if specifically asking about partners/clinics
    let relevantProducts = [];
    if ((isAskingForRecommendations || mentionsSpecificNeed || mentionedCategory) && !isAskingAboutPartners) {
      try {
        // If a specific category is mentioned, search within that category
        if (mentionedCategory) {
          const { products } = await productService.searchProducts({
            category: mentionedCategory.slug,
            limit: 4,
            inStock: true,
          });
          relevantProducts = products;
        } else {
          // Otherwise, do a general search based on keywords
          const searchQuery = extractSearchQuery(message);
          const { products } = await productService.searchProducts({
            query: searchQuery,
            limit: 4,
            inStock: true,
          });
          relevantProducts = products;
        }
        
        // If no products found with search, get some general recommendations
        if (relevantProducts.length === 0) {
          const { products: generalProducts } = await productService.searchProducts({
            limit: 4,
            inStock: true,
          });
          relevantProducts = generalProducts;
        }
        
        response.products = relevantProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    // Fetch relevant partners based on user's needs
    let relevantPartners = [];
    // Show partners for illness/symptoms OR when explicitly asking about wellness products OR when asking about partners
    if (hasSymptoms || isAskingAboutWellness || isAskingAboutPartners) {
      console.log('Fetching partners - isAskingAboutPartners:', isAskingAboutPartners, 'specificClinicType:', specificClinicType);
      
      try {
        // Fetch directly from Strapi API for server-side usage
        const queryParams = new URLSearchParams({
          'populate': 'services',
          'pagination[limit]': '5',
          'pagination[page]': '1'
        });
        
        // Add filters based on what user is asking for
        // Temporarily simplified to ensure we get partners
        if (specificClinicType && /chinese medicine|tcm|traditional/i.test(specificClinicType)) {
          // For Chinese medicine, search in name or description
          queryParams.append('filters[$or][0][name][$containsi]', 'chinese');
          queryParams.append('filters[$or][1][description][$containsi]', 'chinese');
        }
        
        const url = `http://localhost:1337/api/partners?${queryParams}`;
        console.log('Fetching partners from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Strapi partners response:', JSON.stringify(data, null, 2));
        
        // Handle both response formats from Strapi
        const partnersArray = data.data?.partners || data.data || [];
        
        if (Array.isArray(partnersArray) && partnersArray.length > 0) {
          relevantPartners = partnersArray.slice(0, 3).map((partner: any) => ({
            id: partner.id,
            documentId: partner.documentId,
            name: partner.name,
            address: partner.address,
            phone: partner.phone,
            rating: partner.rating || 5.0,
            services: partner.services || [],
            description: partner.description,
            specializations: partner.specializations
          }));
        }
        
        console.log('Transformed partners:', relevantPartners);
        response.partners = relevantPartners;
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    }

    // Add context based on user's needs
    let contextualGuidance = '';
    if (hasSymptoms) {
      const activeSymptoms = [];
      if (symptoms.pain) activeSymptoms.push('pain/headache');
      if (symptoms.fever) activeSymptoms.push('fever');
      if (symptoms.cold) activeSymptoms.push('cold/flu symptoms');
      if (symptoms.fatigue) activeSymptoms.push('fatigue');
      if (symptoms.stress) activeSymptoms.push('stress/anxiety');
      if (symptoms.sleep) activeSymptoms.push('sleep issues');
      if (symptoms.stomach) activeSymptoms.push('digestive issues');
      if (symptoms.allergy) activeSymptoms.push('allergic reactions');
      
      contextualGuidance = `\n\nThe user is experiencing: ${activeSymptoms.join(', ')}. Please acknowledge their symptoms and recommend appropriate over-the-counter medications like paracetamol for pain/fever, antihistamines for allergies, etc., if we have them in our catalog.`;
    } else if (isAskingAboutWellness) {
      contextualGuidance = '\n\nThe user is asking about wellness products (vitamins/supplements). Be enthusiastic and informative about the benefits. Do NOT apologize or mention symptoms they don\'t have.';
    } else if (isAskingAboutPartners) {
      contextualGuidance = '\n\nThe user is asking about healthcare partners/clinics. Provide information about our partner network and their services. Be helpful and informative.';
    }

    // Generate AI response with product context
    const productContext = relevantProducts.length > 0 
      ? `\n\nAvailable products in our catalog that might help:\n${relevantProducts.map(p => `- ${p.name}: ${p.description?.substring(0, 150) || 'Premium health product'}... (Price: $${p.price})`).join('\n')}`
      : '\n\nNote: We might not have specific pain relief medications in our current catalog, but I can suggest general wellness products that may help support your recovery.';

    // Add partner context based on user's needs
    const partnerContext = relevantPartners.length > 0
      ? hasSymptoms
        ? `\n\nHealthcare partners offering medical consultation and treatment:\n${relevantPartners.map(p => `- ${p.name}: ${p.address || 'Visit for location details'} (Rating: ${p.rating || 'N/A'}/5)`).join('\n')}`
        : `\n\nHealthcare partners where you can get professional consultation and wellness products:\n${relevantPartners.map(p => `- ${p.name}: ${p.address || 'Visit for location details'} (Rating: ${p.rating || 'N/A'}/5)`).join('\n')}`
      : '';

    // Add available categories context
    const categoryContext = categories.length > 0
      ? `\n\nAvailable product categories: ${categories.map(c => c.name).join(', ')}`
      : '';

    const enhancedPrompt = relevantProducts.length > 0 
      ? isAskingAboutWellness 
        ? `${message}\n\nPlease recommend specific products from our catalog listed above. ${relevantPartners.length > 0 ? 'Also mention that they can visit our healthcare partners for professional consultation and a wider selection of wellness products.' : ''} Focus on their benefits and features. Be enthusiastic and informative.`
        : `${message}\n\nPlease recommend specific products from our catalog listed above and explain why they would help. ${relevantPartners.length > 0 ? 'IMPORTANT: Also mention that they can visit our healthcare partners/clinics for professional medical consultation and treatment.' : ''} If the user has symptoms like headache or fever, acknowledge these and suggest appropriate medications if available. Be specific about product names, dosage recommendations, and benefits.`
      : isAskingAboutWellness
        ? `${message}\n\nProvide helpful information about wellness products and their benefits. ${relevantPartners.length > 0 ? 'Mention that they can visit our healthcare partners for professional consultation and wellness products.' : ''} Be enthusiastic and informative.`
        : isAskingAboutPartners
        ? `${message}\n\n${relevantPartners.length > 0 ? 'Provide information about our healthcare partners listed above, including their locations, services, and how to book appointments with them.' : 'Explain that we have a network of healthcare partners where customers can get professional medical consultation and wellness products.'} Be helpful and informative.`
        : `${message}\n\nIf the user mentions symptoms, acknowledge them and provide appropriate advice. ${relevantPartners.length > 0 ? 'Recommend they visit our healthcare partners/clinics for proper medical consultation.' : ''} Suggest they consider common over-the-counter medications like paracetamol for pain/fever, even if not in our catalog.`;

    const { text } = await generateText({
      model: openaiModel,
      system: SYSTEM_PROMPT + contextPrompt + contextualGuidance + productContext + partnerContext + categoryContext,
      prompt: enhancedPrompt,
      temperature: 0.7,
      maxRetries: 2,
    });

    response.message = text;

    // Generate dynamic suggestions based on actual products and categories
    const suggestions: string[] = [];
    
    // Add category-based suggestions
    if (categories.length > 0) {
      const randomCategories = categories
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      randomCategories.forEach(cat => {
        suggestions.push(`Show me ${cat.name.toLowerCase()} products`);
      });
    }

    // Add need-based suggestions
    if (hasSymptoms) {
      if (symptoms.pain || symptoms.fever) {
        suggestions.push('What is the recommended dosage for paracetamol?');
        suggestions.push('Are there any side effects I should know about?');
      }
      if (symptoms.cold) {
        suggestions.push('What else can help with cold symptoms?');
      }
      suggestions.push('When should I see a doctor?');
    } else {
      suggestions.push('What products help with energy?');
      suggestions.push('Tell me about membership benefits');
    }

    response.suggestions = suggestions.slice(0, 4); // Limit to 4 suggestions

    // If the user is asking for specific products and mentioned a category, add an action
    if (isAskingForRecommendations && mentionedCategory) {
      response.actions = [
        {
          type: 'show_products',
          payload: { 
            category: mentionedCategory.slug,
            categoryName: mentionedCategory.name 
          },
        },
      ];
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        message: 'I apologize, but I encountered an error. Please try again or browse our products directly.'
      },
      { status: 500 }
    );
  }
}

// Helper function to extract search query from user message
function extractSearchQuery(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Map symptoms to appropriate product searches
  if (/headache|migraine|head.*pain/i.test(lowerMessage)) {
    return 'pain relief paracetamol acetaminophen headache';
  }
  if (/fever|temperature/i.test(lowerMessage)) {
    return 'fever reducer paracetamol acetaminophen';
  }
  if (/cold|flu|cough/i.test(lowerMessage)) {
    return 'cold flu medicine cough syrup';
  }
  if (/stomach|nausea|digest/i.test(lowerMessage)) {
    return 'antacid stomach digestive';
  }
  if (/allergy|allergic/i.test(lowerMessage)) {
    return 'antihistamine allergy relief';
  }
  if (/pain|ache|sore/i.test(lowerMessage)) {
    return 'pain relief analgesic';
  }
  if (/stress|anxiety/i.test(lowerMessage)) {
    return 'stress relief calming supplement';
  }
  if (/sleep|insomnia/i.test(lowerMessage)) {
    return 'sleep aid melatonin';
  }
  if (/energy|fatigue|tired/i.test(lowerMessage)) {
    return 'energy vitamin b complex ginseng';
  }
  
  // Default: extract meaningful keywords
  const keywords = lowerMessage
    .replace(/please|can you|could you|i need|i want|i have|i am|show me|find|recommend|suggest|what|which|looking for|help me|with|for|my|a|an|the|is|are|do|you|have|ill|sick|days/gi, '')
    .replace(/[.,!?]/g, '') // Remove punctuation
    .trim();
  
  // If keywords are too short, return a more generic search
  return keywords.length > 2 ? keywords : 'health wellness medicine';
}