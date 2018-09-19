import { configure } from '@storybook/react';

const req = require.context('../imports/ui/components', true, /\.stories\.js$/);

function loadStories() {
  require('../.stories');
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
