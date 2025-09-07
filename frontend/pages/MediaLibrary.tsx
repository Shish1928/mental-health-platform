import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Download, 
  Heart, 
  Search, 
  Filter,
  Clock,
  Star
} from 'lucide-react';
import backend from '~backend/client';
import type { MediaContent } from '~backend/media/list_content';

const categories = [
  'All',
  'meditation',
  'anxiety',
  'sleep',
  'focus',
  'stress',
  'mindfulness',
  'breathing'
];

const contentTypes = [
  'All',
  'audio',
  'video',
  'article'
];

export default function MediaLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['media-content', selectedCategory, selectedType],
    queryFn: () => backend.media.listContent({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      contentType: selectedType === 'All' ? undefined : selectedType,
      language: 'en',
      limit: 50,
      offset: 0,
    }),
  });

  const filteredContent = contentData?.content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePlay = (contentId: string) => {
    if (currentPlaying === contentId) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(contentId);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
        <p className="text-muted-foreground">
          Access guided meditations, relaxation videos, and wellness content 
          tailored to support your mental health journey.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Category:</span>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Type:</span>
              {contentTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="space-y-3 pt-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content) => (
            <Card key={content.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                {content.thumbnailUrl ? (
                  <img
                    src={content.thumbnailUrl}
                    alt={content.title}
                    className="w-full aspect-video object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">{getContentIcon(content.contentType)}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handlePlay(content.id)}
                  >
                    {currentPlaying === content.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="absolute top-2 right-2 flex space-x-1">
                  {content.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge className={`text-xs text-white ${getDifficultyColor(content.difficultyLevel)}`}>
                    {content.difficultyLevel}
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-1">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{content.durationMinutes || 0} min</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {content.category}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePlay(content.id)}
                    >
                      {currentPlaying === content.id ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Heart className="w-3 h-3" />
                    </Button>
                    
                    {content.isDownloadable && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredContent.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium text-foreground mb-2">No content found</h3>
              <p>Try adjusting your search criteria or browse different categories.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
