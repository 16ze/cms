import React from 'react';

interface IconProps {
 className?: string;
 size?: number;
}

export const SearchIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
 <svg 
 width={size} 
 height={size} 
 viewBox="0 0 24 24" 
 fill="none" 
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path 
 d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 </svg>
);

export const DesignIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
 <svg 
 width={size} 
 height={size} 
 viewBox="0 0 24 24" 
 fill="none" 
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path 
 d="M12 2L2 7L12 12L22 7L12 2Z" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 <path 
 d="M2 17L12 22L22 17" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 <path 
 d="M2 12L12 17L22 12" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
 <svg 
 width={size} 
 height={size} 
 viewBox="0 0 24 24" 
 fill="none" 
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path 
 d="M16 18L22 12L16 6" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 <path 
 d="M8 6L2 12L8 18" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 </svg>
);

export const TestIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
 <svg 
 width={size} 
 height={size} 
 viewBox="0 0 24 24" 
 fill="none" 
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path 
 d="M9 12L11 14L15 10" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 <path 
 d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
 stroke="currentColor" 
 strokeWidth="2"
 />
 </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
 <svg 
 width={size} 
 height={size} 
 viewBox="0 0 24 24" 
 fill="none" 
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path 
 d="M4.5 16.5C3 15 2.25 13.5 2.25 12C2.25 10.5 3 9 4.5 7.5L7.5 4.5C9 3 10.5 2.25 12 2.25C13.5 2.25 15 3 16.5 4.5L19.5 7.5C21 9 21.75 10.5 21.75 12C21.75 13.5 21 15 19.5 16.5L16.5 19.5C15 21 13.5 21.75 12 21.75C10.5 21.75 9 21 7.5 19.5L4.5 16.5Z" 
 stroke="currentColor" 
 strokeWidth="2" 
 strokeLinecap="round" 
 strokeLinejoin="round"
 />
 <path 
 d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
 stroke="currentColor" 
 strokeWidth="2"
 />
 </svg>
);

// Fonction helper pour obtenir l'icône par nom
export const getProcessIcon = (iconName: string, props?: IconProps) => {
 const icons: { [key: string]: React.FC<IconProps> } = {
 search: SearchIcon,
 design: DesignIcon,
 code: CodeIcon,
 test: TestIcon,
 rocket: RocketIcon,
 };
 
 const IconComponent = icons[iconName] || SearchIcon;
 return <IconComponent {...props} />;
};
