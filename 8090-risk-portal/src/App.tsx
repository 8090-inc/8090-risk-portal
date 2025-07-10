import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Spinner,
  Tooltip
} from './components/ui';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-8090-primary mb-8">
          8090 Risk Portal Component Library
        </h1>

        <div className="space-y-8">
          {/* Buttons */}
          <Card title="Buttons" subtitle="Various button styles and states">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button disabled>Disabled Button</Button>
              <Button loading onClick={handleLoadingClick}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
            </div>
          </Card>

          {/* Badges */}
          <Card title="Badges" subtitle="Risk levels and status indicators">
            <div className="flex flex-wrap gap-2">
              <Badge variant="risk-critical">Critical Risk</Badge>
              <Badge variant="risk-high">High Risk</Badge>
              <Badge variant="risk-medium">Medium Risk</Badge>
              <Badge variant="risk-low">Low Risk</Badge>
              <Badge variant="status-implemented">Implemented</Badge>
              <Badge variant="status-in-progress">In Progress</Badge>
              <Badge variant="status-not-implemented">Not Implemented</Badge>
              <Badge variant="status-overdue">Overdue</Badge>
              <Badge variant="status-due-soon">Due Soon</Badge>
            </div>
          </Card>

          {/* Form Elements */}
          <Card title="Form Elements" subtitle="Input fields and selects">
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helpText="We'll never share your email"
                fullWidth
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
                fullWidth
              />
              <Select
                label="Select Option"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                placeholder="Choose an option"
                helpText="Select one of the available options"
                fullWidth
              />
            </div>
          </Card>

          {/* Loading States */}
          <Card title="Loading States" subtitle="Various spinner sizes and colors">
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <div className="bg-8090-primary p-4 rounded">
                <Spinner color="white" />
              </div>
            </div>
          </Card>

          {/* Tooltips */}
          <Card title="Tooltips" subtitle="Hover over elements for tooltips">
            <div className="flex gap-4">
              <Tooltip content="This is a primary button">
                <Button variant="primary">Hover me</Button>
              </Tooltip>
              <Tooltip content="This badge shows critical risk level" placement="bottom">
                <Badge variant="risk-critical">Critical</Badge>
              </Tooltip>
              <Tooltip content="This is helpful information" placement="right">
                <span className="text-8090-primary cursor-help">ⓘ Info</span>
              </Tooltip>
            </div>
          </Card>

          {/* Modal */}
          <Card title="Modal" subtitle="Click button to open modal">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <p className="text-gray-600 mb-4">
                This is an example modal dialog. You can put any content here.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </Modal>
          </Card>

          {/* Card Variations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              title="Small Padding"
              subtitle="With hover effect"
              padding="sm"
              hover
            >
              This card has small padding and hover effect
            </Card>
            <Card
              title="Medium Shadow"
              shadow="md"
            >
              This card has medium shadow
            </Card>
            <Card
              title="Large Padding"
              padding="lg"
              shadow="lg"
            >
              This card has large padding and shadow
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
