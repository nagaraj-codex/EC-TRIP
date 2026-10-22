import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('renders without crashing', () => {
    const { container } = render(<TextField label="test" />);
    expect(container).toBeTruthy();
  });
});
