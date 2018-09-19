import React from 'react';
import { storiesOf } from '@storybook/react';

import FullScreenSpinner from './fullScreenSpinner';

storiesOf('FullScreenSpinner', module)
  .add('open', () => (
    <FullScreenSpinner open />
  ))
  .add('closed', () => (
    <FullScreenSpinner />
  ));
