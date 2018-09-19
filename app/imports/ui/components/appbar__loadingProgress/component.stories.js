import React from 'react';
import { storiesOf } from '@storybook/react';

import AppBarLoadingProgress from './styled';

storiesOf('AppBarLoadingProgress', module).add('shown', () => (
  <AppBarLoadingProgress show />
));
