import React from 'react';
import { Plus, Target, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Goal, Favorite } from './types';

interface TimerSidebarProps {
  goals: Goal[];
  favorites: Favorite[];
  onCreateGoal: () => void;
  onAddFavorite: () => void;
  onGoalClick?: (goal: Goal) => void;
  onFavoriteClick?: (favorite: Favorite) => void;
}

export const TimerSidebar: React.FC<TimerSidebarProps> = ({
  goals,
  favorites,
  onCreateGoal,
  onAddFavorite,
  onGoalClick,
  onFavoriteClick,
}) => {
  const [goalsExpanded, setGoalsExpanded] = React.useState(true);
  const [favoritesExpanded, setFavoritesExpanded] = React.useState(true);

  return (
    <div className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col">
      {/* Goals Section */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => setGoalsExpanded(!goalsExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-white">Goals</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              !goalsExpanded && "-rotate-90"
            )}
          />
        </button>

        {goalsExpanded && (
          <div className="pb-4 px-4 space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No goals yet
              </p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg border border-gray-800 hover:border-purple-600/50 cursor-pointer transition-colors bg-gray-900"
                  onClick={() => onGoalClick?.(goal)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-white">{goal.title}</span>
                    <span className="text-xs text-gray-400">
                      {goal.current}h / {goal.target}h
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
              ))
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={onCreateGoal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create a Goal
            </Button>
          </div>
        )}
      </div>

      {/* Favorites Section */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => setFavoritesExpanded(!favoritesExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-white">Favorites</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              !favoritesExpanded && "-rotate-90"
            )}
          />
        </button>

        {favoritesExpanded && (
          <div className="pb-4 px-4 space-y-2">
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No favorites yet
              </p>
            ) : (
              favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="p-3 rounded-lg border border-gray-800 hover:border-purple-600/50 cursor-pointer transition-colors bg-gray-900"
                  onClick={() => onFavoriteClick?.(favorite)}
                >
                  <div className="font-medium text-sm text-white">{favorite.description}</div>
                  {favorite.project && (
                    <div className="text-xs text-gray-400 mt-1">
                      {favorite.project}
                    </div>
                  )}
                </div>
              ))
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={onAddFavorite}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Favorite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

