import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders without crashing', () => {
    const { container } = render(<Chip      >Test</Chip>);
    expect(container).toBeTruthy();
  });
});
