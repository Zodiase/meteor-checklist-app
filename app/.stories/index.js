import React from 'react';
import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { action } from '@storybook/addon-actions';
import Button from './Button';
import Welcome from './Welcome';
import FullScreenSpinner from '/imports/ui/components/fullScreenSpinner';
import AppBarLoadingProgress from '/imports/ui/components/appbar__loadingProgress/styled';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>
  ));

storiesOf('FullScreenSpinner', module)
  .add('open', () => (
    <FullScreenSpinner open />
  ))
  .add('closed', () => (
    <FullScreenSpinner />
  ));

storiesOf('AppBarLoadingProgress', module)
  .add('shown', () => (
    <AppBarLoadingProgress show />
  ));

import './ChecklistTemplateIndexPage';
