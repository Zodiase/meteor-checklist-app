import React from 'react';
import { HashRouter } from 'react-router-dom';
import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { action } from '@storybook/addon-actions';
import ChecklistTemplateIndexPage from './styled';

storiesOf('ChecklistTemplateIndexPage', module)
  .add('empty', () => (
    <ChecklistTemplateIndexPage
      subscribeChecklistTemplates={action('subscribeChecklistTemplates')}
      stopSubscriptionOfChecklistTemplates={action(
        'stopSubscriptionOfChecklistTemplates',
      )}
      requestToCreateNewChecklistTemplate={action(
        'requestToCreateNewChecklistTemplate',
      )}
      isChecklistTemplateListDataLoading={false}
      isChecklistTemplateListDataReady
      listOfChecklistTemplates={[]}
    />
  ))
  .add('loading', () => (
    <ChecklistTemplateIndexPage
      subscribeChecklistTemplates={action('subscribeChecklistTemplates')}
      stopSubscriptionOfChecklistTemplates={action(
        'stopSubscriptionOfChecklistTemplates',
      )}
      requestToCreateNewChecklistTemplate={action(
        'requestToCreateNewChecklistTemplate',
      )}
      isChecklistTemplateListDataLoading
    />
  ))
  .add('with items', () => (
    <HashRouter>
      <ChecklistTemplateIndexPage
        subscribeChecklistTemplates={action('subscribeChecklistTemplates')}
        stopSubscriptionOfChecklistTemplates={action(
          'stopSubscriptionOfChecklistTemplates',
        )}
        requestToCreateNewChecklistTemplate={action(
          'requestToCreateNewChecklistTemplate',
        )}
        isChecklistTemplateListDataLoading={false}
        isChecklistTemplateListDataReady
        listOfChecklistTemplates={[
          {
            _id: 'item-1',
            name: 'Item 1',
            stepCount: 7,
          },
          {
            _id: 'item-2',
            name: 'Item 2',
            stepCount: 4,
          },
          {
            _id: 'item-3',
            name: 'Item 3',
            stepCount: 0,
          },
        ]}
        getUriPathToChecklistTemplateItem={() => '#'}
      />
    </HashRouter>
  ));
