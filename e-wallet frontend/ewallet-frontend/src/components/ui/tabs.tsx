import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const triggerTabs = React.Children.toArray(children).filter(
    (child: any) => child.type.displayName === 'TabsTrigger'
  );

  const contentTabs = React.Children.toArray(children).filter(
    (child: any) => child.type.displayName === 'TabsContent' && child.props.value === activeTab
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">{triggerTabs.map((trigger: any) => React.cloneElement(trigger, { activeTab, setActiveTab }))}</div>
      <div>{contentTabs}</div>
    </div>
  );
};
Tabs.displayName = 'Tabs';

export const TabsList = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex gap-2">{children}</div>;
};
TabsList.displayName = 'TabsList';

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => {
  const isActive = activeTab === value;
  return (
    <button
      className={`px-4 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'} hover:bg-blue-400`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return <div>{children}</div>;
};
TabsContent.displayName = 'TabsContent';
