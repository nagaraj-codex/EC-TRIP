import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBlock } from './StatusBlock';

describe('StatusBlock', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatusBlock type="empty" title="t" help="h"      />);
    expect(container).toBeTruthy();
  });
});
