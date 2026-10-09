import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    const { container } = render(<Button      >Test</Button>);
    expect(container).toBeTruthy();
  });
});
