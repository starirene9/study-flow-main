import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground touch-manipulation"
              aria-label={t('common.language')}
            >
              <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => changeLanguage('en')}
              className={i18n.language === 'en' ? 'bg-accent' : ''}
            >
              {t('common.english')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage('ko')}
              className={i18n.language === 'ko' ? 'bg-accent' : ''}
            >
              {t('common.korean')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('common.language')}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default LanguageToggle;
