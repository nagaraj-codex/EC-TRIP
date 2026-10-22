import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Avatar      >Test</Avatar>);
    expect(container).toBeTruthy();
  });
});
