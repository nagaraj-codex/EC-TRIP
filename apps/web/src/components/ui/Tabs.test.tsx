import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tabs } from './Tabs';

describe('Tabs', () => {
  it('renders without crashing', () => {
    const { container } = render(<Tabs   items={[{id:'1',label:'1',content:'1'}]}    />);
    expect(container).toBeTruthy();
  });
});
