declare module 'next/dynamic' {
  const dynamic: any;
  export default dynamic;
}

declare module 'next/link' {
  import type * as React from 'react';
  const Link: React.ComponentType<any>;
  export default Link;
}

