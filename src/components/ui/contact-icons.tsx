"use client";

interface ContactIconProps {
 name: string;
 className?: string;
 size?: number;
}

export function ContactIcon({
 name,
 className = "",
 size = 24,
}: ContactIconProps) {
 const icons: Record<string, JSX.Element> = {
 // Icônes pour les informations de contact
 phone: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9048 21.7335 20.6407 21.8227C20.3766 21.9119 20.0965 21.9452 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09494 3.90347 2.12826 3.62332 2.21753 3.35921C2.3068 3.0951 2.45021 2.85297 2.63849 2.64778C2.82677 2.44259 3.05581 2.27896 3.31101 2.16736C3.56621 2.05576 3.84195 1.99878 4.11999 2H7.11999C7.59522 1.99522 8.06574 2.16708 8.43377 2.48353C8.8018 2.79999 9.042 3.23945 9.11999 3.72C9.23662 4.68007 9.47145 5.62273 9.81999 6.53C9.94454 6.88792 9.97305 7.27675 9.90252 7.65382C9.83199 8.03088 9.66517 8.38247 9.41999 8.67L8.11999 9.97C9.38035 12.4244 11.5756 14.6196 14.03 15.88L15.33 14.58C15.6175 14.3348 15.9691 14.168 16.3462 14.0975C16.7232 14.027 17.1121 14.0555 17.47 14.18C18.3773 14.5285 19.3199 14.7634 20.28 14.88C20.7658 14.9586 21.2094 15.2032 21.5265 15.5765C21.8437 15.9498 22.0122 16.4266 22 16.92Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 email: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <polyline
 points="22,6 12,13 2,6"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 location: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <circle
 cx="12"
 cy="10"
 r="3"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 clock: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <polyline
 points="12,6 12,12 16,14"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),

 // Icônes pour les réseaux sociaux
 linkedin: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8V8Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M6 9H2V21H6V9Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 facebook: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 instagram: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <rect
 x="2"
 y="2"
 width="20"
 height="20"
 rx="5"
 ry="5"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M17.5 6.5H17.51"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),

 // Icône par défaut
 default: (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M12 16V12"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M12 8H12.01"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 ),
 };

 return (
 <div className={`contact-icon ${className}`}>
 {icons[name] || icons["default"]}
 </div>
 );
}
