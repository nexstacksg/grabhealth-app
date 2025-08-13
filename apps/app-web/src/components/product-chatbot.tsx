'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, ShoppingBag, ArrowRight, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { formatPrice } from '@/lib/utils';
import React from 'react';
import services from '@/services';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Product {
  id?: number;
  documentId?: string;
  name: string;
  description: string;
  price: number;
  discount_essential?: number;
  discount_premium?: number;
  category?: any;
  imageUrl?: string;
  image_url?: string;
  inStock?: boolean;
  in_stock?: boolean;
}

export function ProductChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! 👋 I'm HealthBot, your personal wellness assistant. I'm here to help you find the perfect health products from our collection.",
    },
    {
      id: '2',
      role: 'assistant',
      content:
        "How can I help you today? You can ask me about:\n• Product recommendations for specific health needs\n• Information about our products\n• Help finding the right wellness solutions\n• General health and wellness advice",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendedPartners, setRecommendedPartners] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [initialSuggestionsLoaded, setInitialSuggestionsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial suggestions from categories
  useEffect(() => {
    async function loadInitialSuggestions() {
      if (initialSuggestionsLoaded) return;
      
      try {
        const categories = await services.category.getCategories();
        if (categories.length > 0) {
          const dynamicSuggestions = [
            'What products help with wellness?',
            categories.length > 0 ? `Show me ${categories[0].name.toLowerCase()}` : 'Show me vitamins & supplements',
            'Where are your healthcare partner clinics?',
            'I need help finding health products',
          ];
          setSuggestions(dynamicSuggestions);
        } else {
          // Fallback suggestions if categories fail to load
          setSuggestions([
            'What products help with wellness?',
            'Show me vitamins & supplements',
            'Where are your healthcare partners?',
            'I need help finding health products',
          ]);
        }
        setInitialSuggestionsLoaded(true);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        // Set fallback suggestions on error
        setSuggestions([
          'What products help with wellness?',
          'Show me vitamins & supplements',
          'Where are your healthcare partners?',
          'I need help finding health products',
        ]);
        setInitialSuggestionsLoaded(true);
      }
    }

    loadInitialSuggestions();
  }, [initialSuggestionsLoaded]);

  const handleViewProduct = (productId: number | string | undefined) => {
    if (!productId) return;
    
    // Close the chatbot
    setIsOpen(false);

    // Navigate to the product page using Next.js router
    router.push(`/products/${productId}`);
  };

  const handleViewPartner = (partnerId: number | string | undefined) => {
    if (!partnerId) return;
    
    // Close the chatbot
    setIsOpen(false);

    // Navigate to the partner page using Next.js router
    router.push(`/partners/${partnerId}`);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRecommendedProducts([]);
    setRecommendedPartners([]);

    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    try {
      // Use AI service for chatbot functionality
      const response = await services.ai.sendChatbotMessage(input, {
        productId: undefined,
        categoryId: undefined,
        orderId: undefined,
      });
      
      // Check if we got a valid response
      if (!response || !response.message) {
        throw new Error('Invalid response from chatbot service');
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle product recommendations from response
      if (response.products && response.products.length > 0) {
        console.log('Setting recommended products:', response.products);
        setRecommendedProducts(response.products);
      }
      
      // Handle partner recommendations from response
      if (response.partners && response.partners.length > 0) {
        console.log('Setting recommended partners:', response.partners);
        setRecommendedPartners(response.partners);
      } else {
        console.log('No partners in response:', response);
      }
      
      if (response.actions && response.actions.length > 0) {
        // Fallback to actions if no products in response
        for (const action of response.actions) {
          if (action.type === 'show_products' && action.payload.category) {
            // Fetch products based on category
            try {
              const { products } = await services.product.searchProducts({
                category: action.payload.category as string,
                limit: 4,
                inStock: true,
              });
              if (products.length > 0) {
                setRecommendedProducts(products);
              }
            } catch (err) {
              console.error('Error fetching recommended products:', err);
            }
          }
        }
      }

      // Update suggestions based on response
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Chatbot error details:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize for the inconvenience. I\'m having trouble connecting right now. In the meantime, you can browse our products directly or try again in a moment.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);

      // Scroll to bottom again after new messages
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
  };

  // Function to format bot messages with enhanced styling
  const formatBotMessage = (content: string) => {
    // Process bold text (enclosed in ** or __)
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Process bullet points
    formattedContent = formattedContent
      .replace(
        /^\s*•\s*(.+)$/gm,
        '<div class="flex items-start mb-1"><span class="text-emerald-500 mr-2 mt-0.5">•</span><span>$1</span></div>'
      )
      .replace(
        /^\s*-\s*(.+)$/gm,
        '<div class="flex items-start mb-1"><span class="text-emerald-500 mr-2 mt-0.5">•</span><span>$1</span></div>'
      );

    // Process numbered lists
    formattedContent = formattedContent.replace(
      /^\s*(\d+)\.(\s*.+)$/gm,
      '<div class="flex items-start mb-1"><span class="text-emerald-600 font-medium mr-2">$1.</span><span>$2</span></div>'
    );

    // Process highlighted text
    formattedContent = formattedContent.replace(
      /`(.*?)`/g,
      '<span class="bg-emerald-100 text-emerald-800 px-1 rounded">$1</span>'
    );

    // Process product names with special styling
    formattedContent = formattedContent.replace(
      /\[(.*?)\]/g,
      '<span class="text-emerald-600 font-medium">$1</span>'
    );

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 h-14 sm:h-20 w-14 sm:w-20 rounded-full shadow-xl bg-transparent z-50 flex items-center justify-center transition-all duration-200 hover:scale-105 overflow-visible p-0 border-2 border-white"
        aria-label="Open health assistant chatbot"
      >
        <Image
          src="/robot.png"
          alt="HealthBot"
          width={40}
          height={40}
          className="h-14 w-14 sm:h-20 sm:w-20"
        />
      </Button>

      {/* Chatbot container */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 sm:bottom-8 sm:right-28 w-full sm:w-[380px] md:w-[420px] lg:w-[480px] h-[90vh] sm:h-[650px] md:h-[700px] bg-white rounded-none sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-emerald-100"
          style={{
            animation:
              'chatbotAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            boxShadow:
              '0 12px 28px rgba(0, 0, 0, 0.12), 0 8px 10px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(0)',
          }}
        >
          <style jsx global>{`
            @keyframes chatbotAppear {
              from {
                transform: translateY(40px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @media (max-width: 640px) {
              @keyframes chatbotAppear {
                from {
                  transform: translateY(100%);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            }

            .message-bubble {
              transition: all 0.3s ease;
            }

            .message-bubble:hover {
              transform: translateY(-2px);
            }

            .product-card {
              transition: all 0.2s ease;
            }

            .product-card:hover {
              transform: translateY(-3px);
              box-shadow:
                0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
          `}</style>
          {/* Header */}
          <div className="border-b p-4 sm:p-5 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-none sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full shadow-inner">
                <Image
                  src="/robot.png"
                  alt="HealthBot"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <div>
                <h2 className="font-bold text-lg sm:text-xl tracking-tight">
                  HealthBot
                </h2>
                <p className="text-xs sm:text-sm opacity-90 font-medium">
                  Your Personal Health Assistant
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full h-10 w-10 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat area */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <Image
                          src="/robot.png"
                          alt="HealthBot"
                          width={28}
                          height={28}
                          className="h-7 w-7"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 message-bubble ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {message.role === 'assistant'
                          ? formatBotMessage(message.content)
                          : message.content}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                        <span className="text-xs text-white font-medium">
                          You
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Show recommended products after this message if it's the last assistant message */}
                  {message.role === 'assistant' && 
                   index === messages.length - 1 && 
                   recommendedProducts.length > 0 && (
                    <div className="my-4 ml-10">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                          <ShoppingBag className="h-3 w-3 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-medium text-emerald-700">
                          Recommended for you
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3 ml-4 sm:ml-8">
                        {recommendedProducts.map((product) => (
                          <Card
                            key={product.id || product.documentId}
                            className="overflow-hidden border-emerald-100 hover:border-emerald-200 transition-colors product-card"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-20 sm:w-24 h-20 sm:h-24 relative flex-shrink-0 rounded-lg overflow-hidden border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200">
                                  <Image
                                    src={
                                      product.imageUrl ||
                                      '/placeholder-product.png'
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-110"
                                  />
                                  {product.inStock ? (
                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-medium py-0.5 text-center">
                                      In Stock
                                    </div>
                                  ) : (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gray-500 text-white text-[10px] font-medium py-0.5 text-center">
                                      Out of Stock
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-base truncate text-gray-800">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {product.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-3">
                                    <div>
                                      <p className="font-semibold text-lg text-emerald-600">
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                                      onClick={() => handleViewProduct(product.id || product.documentId)}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show recommended partners after this message if it's the last assistant message */}
                  {message.role === 'assistant' && 
                   index === messages.length - 1 && 
                   recommendedPartners.length > 0 && (
                    <div className="my-4 ml-10">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <MapPin className="h-3 w-3 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-blue-700">
                          Healthcare Partners Near You
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3 ml-4 sm:ml-8">
                        {recommendedPartners.map((partner) => (
                          <Card
                            key={partner.id || partner.documentId}
                            className="overflow-hidden border-blue-100 hover:border-blue-200 transition-colors product-card"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-20 sm:w-24 h-20 sm:h-24 relative flex-shrink-0 rounded-lg overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                  <div className="flex items-center justify-center h-full">
                                    <MapPin className="h-10 w-10 text-blue-600" />
                                  </div>
                                  {partner.rating && partner.rating >= 4.5 && (
                                    <div className="absolute top-1 right-1 bg-yellow-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                      ⭐ {partner.rating}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-base truncate text-gray-800">
                                    {partner.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    <MapPin className="inline h-3 w-3 mr-1" />
                                    {partner.address || 'Visit for location details'}
                                  </p>
                                  {partner.services && partner.services.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {partner.services.slice(0, 2).map((service: any, idx: number) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {service.name || service}
                                        </span>
                                      ))}
                                      {partner.services.length > 2 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                          +{partner.services.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-3">
                                      {partner.rating && (
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                          <span className="text-sm ml-1 font-medium">{partner.rating}/5</span>
                                        </div>
                                      )}
                                      {partner.phone && (
                                        <span className="text-xs text-gray-500">
                                          📞 Available
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                      onClick={() => handleViewPartner(partner.id || partner.documentId)}
                                    >
                                      View Details & Book
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}


              {isLoading && (
                <div className="flex justify-start">
                  <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <Image
                      src="/robot.png"
                      alt="HealthBot"
                      width={28}
                      height={28}
                      className="h-7 w-7"
                    />
                  </div>
                  <div className="max-w-[80%] rounded-2xl p-3 bg-gray-100 rounded-tl-none">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {messages.length <= 3 && (
            <div className="p-3 sm:p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-all duration-200 hover:translate-x-1"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ArrowRight className="h-3 w-3 mr-2 text-emerald-500" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t p-4 sm:p-5 flex gap-3 bg-gradient-to-b from-white to-gray-50">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about health products..."
                className="flex-1 border-emerald-200 focus-visible:ring-emerald-500 rounded-full py-5 sm:py-6 px-4 sm:px-5 shadow-sm pr-12 text-sm sm:text-base"
                disabled={isLoading}
              />
              {input.trim().length > 0 && (
                <X
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setInput('')}
                />
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
