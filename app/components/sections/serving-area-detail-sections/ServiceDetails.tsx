'use client';

import React, { useState } from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc } from '@/app/lib/utils';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { ChevronDown, ChevronUp, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

interface ServiceDetailsProps {
  details: any;
  className?: string;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  // More permissive check - render if there's any content
  if (!details || (!details.title && !details.description && (!details.features || details.features.length === 0) && (!details.process || details.process.length === 0) && (!details.benefits || details.benefits.length === 0))) return null;

  const features = details.features || [];
  const process = details.process || [];
  const benefits = details.benefits || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'trending': return <TrendingUp className="w-6 h-6" />;
      default: return <CheckCircle className="w-6 h-6" />;
    }
  };

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  return (
    <section 
      className={cn('py-16 lg:py-24', className)}
      style={{ backgroundColor: themeColors.pageBackground }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 max-w-3xl mx-auto">
            {details.title && (
              <h2 
                className="text-3xl lg:text-5xl font-semibold mb-6"
                style={{ 
                  color: themeColors.lightPrimaryText
                }}
              >
                <TiptapRenderer content={details.title} as="inline" />
              </h2>
            )}
            
            {(details.subtitle || details.description) && (
              <div 
                className="text-lg lg:text-xl leading-relaxed mb-6"
                style={{ 
                  color: themeColors.lightSecondaryText,
                }}
              >
                <TiptapRenderer content={details.subtitle || details.description} as="inline" />
              </div>
            )}
          </div>

        {/* Features Section */}
        {features.length > 0 && (
          <div className="mb-20">
            <h3 
              className="text-2xl lg:text-3xl font-semibold text-center mb-10"
              style={{ 
                color: themeColors.lightPrimaryText,
              }}
            >
              Key Features
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature: any, index: number) => (
                <div 
                  key={index}
                  className="rounded-lg border transition-all duration-200"
                  style={{ 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.inactive
                  }}
                >
                  <button
                    className="w-full p-6 text-left"
                    onClick={() => toggleFeature(index)}
                    style={{}}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                        style={{ backgroundColor: `${themeColors.primaryButton}15` }}
                      >
                        <div style={{ color: themeColors.primaryButton }}>
                          {getIcon(feature.icon)}
                        </div>
                      </div>
                      <div>
                        <h4 
                          className="font-semibold text-lg"
                          style={{ 
                            color: themeColors.lightPrimaryText,
                          }}
                        >
                          <TiptapRenderer content={feature.title} as="inline" />
                        </h4>
                        {feature.shortDescription && (
                          <p 
                            className="text-sm"
                            style={{ 
                              color: themeColors.lightSecondaryText,
                            }}
                          >
                            <TiptapRenderer content={feature.shortDescription} />
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        {expandedFeature === index ? (
                          <ChevronUp className="w-5 h-5" style={{ color: themeColors.primaryButton }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: themeColors.primaryButton }} />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {expandedFeature === index && feature.fullDescription && (
                    <div 
                      className="px-6 pb-6 pt-0 border-t"
                      style={{ borderColor: themeColors.inactive }}
                    >
                      <div 
                        className="pt-4 text-sm leading-relaxed"
                        style={{ 
                          color: themeColors.lightSecondaryText,
                        }}
                      >
                        <TiptapRenderer content={feature.fullDescription} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Section */}
        {process.length > 0 && (
          <div className="mb-20">
            <h3 
              className="text-2xl lg:text-3xl font-semibold text-center mb-12"
              style={{ 
                color: themeColors.lightPrimaryText,
              }}
            >
              Our Process
            </h3>
            
            <div className="max-w-4xl mx-auto space-y-10">
              {process.map((step: any, index: number) => (
                <div key={index} className="flex items-start space-x-6">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                    style={{ backgroundColor: themeColors.primaryButton }}
                  >
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h4 
                      className="text-xl font-semibold mb-2"
                      style={{ 
                        color: themeColors.lightPrimaryText,
                      }}
                    >
                      <TiptapRenderer content={step.title} as="inline" />
                    </h4>
                    {step.description && (
                      <div 
                        className="text-base leading-relaxed"
                        style={{ 
                          color: themeColors.lightSecondaryText,
                        }}
                      >
                        <TiptapRenderer content={step.description} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {benefits.length > 0 && (
          <div className="mb-20">
            <h3 
              className="text-2xl lg:text-3xl font-semibold text-center mb-12"
              style={{ 
                color: themeColors.lightPrimaryText,
              }}
            >
              Benefits
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit: any, index: number) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-6 rounded-lg border"
                  style={{ 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.inactive
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${themeColors.primaryButton}15` }}
                  >
                    <div style={{ color: themeColors.primaryButton }}>
                      {getIcon(benefit.icon)}
                    </div>
                  </div>
                  <div>
                    <h4 
                      className="font-semibold mb-2 text-lg"
                      style={{ 
                        color: themeColors.lightPrimaryText,
                      }}
                    >
                      <TiptapRenderer content={benefit.title} as="inline" />
                    </h4>
                    {benefit.description && (
                      <div 
                        className="text-sm leading-relaxed"
                        style={{ 
                          color: themeColors.lightSecondaryText,
                        }}
                      >
                        <TiptapRenderer content={benefit.description} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {details.ctaButton && (
          <div className="text-center mt-12">
            <button
              className="px-10 py-4 rounded font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: themeColors.primaryButton,
              }}
              onClick={() => details.ctaButton.url && window.open(details.ctaButton.url, '_blank')}
            >
              {details.ctaButton.text}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};