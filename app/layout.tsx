import './globals.css';import type {Metadata} from 'next';
export const metadata:Metadata={title:'Invoix AI',description:'AI invoice maker'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
