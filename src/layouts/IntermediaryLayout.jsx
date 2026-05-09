import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { logout } from '../store/authSlice.js';
import {
  BrandMark,
  Button,
  Container,
  Badge,
} from '../components/shared';

const IntermediaryLayout = () => {
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lic-offwhite text-lic-body">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <Container size="md" className="flex items-center justify-between py-3.5">
          <BrandMark />

          <div className="flex items-center gap-3">
            <Badge tone="indigo" className="hidden border-lic-teal/30 bg-lic-mint text-xs text-lic-charcoal sm:inline-flex">
              Onboarding
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>
              Sign out
            </Button>
          </div>
        </Container>
      </header>

      <main>
        <Container size="md" className="py-12">
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default IntermediaryLayout;
