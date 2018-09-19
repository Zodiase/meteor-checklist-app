import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';

class SortableHandleComponent extends React.Component {
  render() {
    const { style, ...props } = this.props;

    return (
      <div
        {...props}
        style={{
          cursor: 'row-resize',
          ...style,
        }}
      />
    );
  }
}

export default SortableHandle(SortableHandleComponent);
