import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AdminFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const { user } = useAuth();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllAdmins();
      setAdmins(response.admins);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError('Failed to load admin users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteClick = (admin: User) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;
    
    try {
      await userService.deleteUser(selectedAdmin.id);
      setSuccess(`Admin ${selectedAdmin.name} deleted successfully`);
      setDeleteDialogOpen(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleDeleteCancel = () => {
    setSelectedAdmin(null);
    setDeleteDialogOpen(false);
  };

  const handleSubmit = async (
    values: AdminFormValues,
    { resetForm }: FormikHelpers<AdminFormValues>
  ) => {
    try {
      await userService.createAdmin(values.name, values.email, values.password);
      setSuccess('Admin created successfully');
      handleCloseDialog();
      resetForm();
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const adminFormSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required')
  });

  const initialValues: AdminFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const handleCloseAlert = () => {
    setSuccess(null);
    setError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Admin Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ backgroundColor: '#1e6f42' }}
        >
          Add New Admin
        </Button>
      </Box>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<AdminIcon fontSize="small" />}
                      label={admin.role.toUpperCase()}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user?.id !== admin.id && (
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(admin)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary" py={3}>
                      No admin users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Admin Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin</DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={adminFormSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Full Name"
                    fullWidth
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email Address"
                    fullWidth
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Box>
                <Box>
                  <Field
                    as={TextField}
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: '#1e6f42' }}
                >
                  Add Admin
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Admin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManagement;