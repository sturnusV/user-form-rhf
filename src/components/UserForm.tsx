import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios, { AxiosError } from 'axios';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    InputLabel
} from '@mui/material';
import { Email, Person, Phone, Wc, Work, Home, Cake, Alarm } from '@mui/icons-material';

const API_URL = 'https://gorest.co.in/public/v2/users';
const API_TOKEN = import.meta.env.VITE_GOREST_API_TOKEN;

interface UserFormValues {
    name: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    status: 'active' | 'inactive';
    phone?: string;
    address?: string;
    dob?: string;
    occupation?: string;
}

const schema = Yup.object().shape({
    name: Yup.string().required('Name is required').min(3, 'Name must be at least 3 characters.'),
    email: Yup.string().email('Invalid email format').required('A valid email is required.'),
    gender: Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').required('Gender is required.'),
    status: Yup.string().oneOf(['active', 'inactive'], 'Invalid status').required('Status is required.'),
    phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number is invalid (10-15 digits).').nullable().transform((curr, orig) => orig === '' ? null : curr),
    address: Yup.string().max(200, 'Address must be at most 200 characters.').nullable().transform((curr, orig) => orig === '' ? null : curr),
    dob: Yup.date().max(new Date(), 'Date of Birth cannot be in the future.').required('Date of Birth is required').nullable().transform((curr, orig) => orig === '' ? null : curr),
    occupation: Yup.string().max(50, 'Occupation must be at most 50 characters.').nullable().transform((curr, orig) => orig === '' ? null : curr)
});

export const UserForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [fieldServerErrors, setFieldServerErrors] = useState<Record<string, string>>({}); // New state for specific server field errors

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UserFormValues>({
        resolver: yupResolver(schema) as any,
        mode: 'onBlur',
    });

    const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setFieldServerErrors({});

        try {
            const response = await axios.post(API_URL, data, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                setSubmitSuccess(true);
                reset();
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            const newServerErrors: Record<string, string> = {};

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    switch (axiosError.response.status) {
                        case 401:
                            errorMessage = 'Authentication failed. Please check your API token or login again.';
                            break;
                        case 422:
                            const errorsData = axiosError.response.data as { field: string; message: string }[];
                            if (errorsData && Array.isArray(errorsData)) {
                                errorMessage = 'Validation errors:';
                                errorsData.forEach(e => {
                                    newServerErrors[e.field] = e.message;
                                    errorMessage += `\n• ${e.field}: ${e.message}`;
                                });
                                setFieldServerErrors(newServerErrors);
                            } else {
                                errorMessage = 'Validation failed. Please check your input and try again.';
                            }
                            break;
                        case 429:
                            errorMessage = 'Too many requests. Please try again after some time.';
                            break;
                        case 500:
                            errorMessage = 'Server error. Something went wrong on our end. Please try again later.';
                            break;
                        default:
                            errorMessage = `API error: ${axiosError.response.status} - ${axiosError.response.statusText || 'Unknown error'}.`;
                            break;
                    }
                } else if (axiosError.request) {
                    errorMessage = 'No response from server. Please check your internet connection.';
                } else {
                    errorMessage = `Request error: ${axiosError.message}`;
                }
            } else {
                errorMessage = `An unexpected error occurred: ${(error as Error).message}`;
            }

            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSubmitSuccess(false);
        setSubmitError(null);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
                    User Registration
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                    Fields marked with <span style={{ color: 'gray' }}>*</span> are required
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3} direction="column">
                        {/* Name Field */}
                        <Grid>
                            <TextField
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                autoComplete="name"
                                {...register('name')}
                                error={!!errors.name || !!fieldServerErrors.name}
                                helperText={errors.name?.message || fieldServerErrors.name}
                                InputProps={{
                                    startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Email Field */}
                        <Grid>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                autoComplete="email"
                                type="email"
                                {...register('email')}
                                error={!!errors.email || !!fieldServerErrors.email}
                                helperText={errors.email?.message || fieldServerErrors.email}
                                InputProps={{
                                    startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Gender Field */}
                        <Grid>
                            <FormControl fullWidth error={!!errors.gender || !!fieldServerErrors.gender}>
                                <InputLabel id="gender-label">Gender *</InputLabel>
                                <Select
                                    required
                                    fullWidth
                                    labelId="gender-label"
                                    id="gender"
                                    label="Gender"
                                    autoComplete="off"
                                    {...register('gender')}
                                    defaultValue=""
                                    startAdornment={<Wc sx={{ color: 'action.active', mr: 1 }} />}
                                >
                                    <MenuItem value="" disabled>
                                        Please select a gender.
                                    </MenuItem>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                                <FormHelperText>
                                    {errors.gender?.message || fieldServerErrors.gender}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Status Field */}
                        <Grid>
                            <FormControl fullWidth error={!!errors.status || !!fieldServerErrors.status}>
                                <InputLabel id="status-label">Status *</InputLabel>
                                <Select
                                    required
                                    labelId="status-label"
                                    id="status"
                                    label="Status"
                                    autoComplete="off"
                                    {...register('status')}
                                    defaultValue=""
                                    startAdornment={<Alarm sx={{ color: 'action.active', mr: 1 }} />}
                                >
                                    <MenuItem value="" disabled>
                                        Please select a status.
                                    </MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                                <FormHelperText>
                                    {errors.status?.message || fieldServerErrors.status}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Phone Field */}
                        <Grid>
                            <TextField
                                required
                                fullWidth
                                id="phone"
                                label="Phone"
                                autoComplete="tel"
                                {...register('phone')}
                                error={!!errors.phone || !!fieldServerErrors.phone}
                                helperText={errors.phone?.message || fieldServerErrors.phone}
                                InputProps={{
                                    startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Date of Birth Field */}
                        <Grid>
                            <TextField
                                required
                                fullWidth
                                id="dob"
                                label="Date of Birth"
                                autoComplete="off"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                {...register('dob')}
                                error={!!errors.dob || !!fieldServerErrors.dob}
                                helperText={errors.dob?.message || fieldServerErrors.dob}
                                InputProps={{
                                    startAdornment: <Cake sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Address Field */}
                        <Grid>
                            <TextField
                                fullWidth
                                id="street-address"
                                label="Address"
                                autoComplete="street-address"
                                multiline
                                rows={3}
                                {...register('address')}
                                error={!!errors.address || !!fieldServerErrors.address}
                                helperText={errors.address?.message || fieldServerErrors.address}
                                InputProps={{
                                    startAdornment: <Home sx={{ color: 'action.active', mr: 1, mt: 1.5 }} />
                                }}
                            />
                        </Grid>

                        {/* Occupation Field */}
                        <Grid>
                            <TextField
                                fullWidth
                                id="occupation"
                                label="Occupation"
                                autoComplete="occupation"
                                {...register('occupation')}
                                error={!!errors.occupation || !!fieldServerErrors.occupation}
                                helperText={errors.occupation?.message || fieldServerErrors.occupation}
                                InputProps={{
                                    startAdornment: <Work sx={{ color: 'action.active', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid>
                            <Box display="flex" justifyContent="center">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting}
                                    sx={{ width: 200, height: 50 }}
                                >
                                    {isSubmitting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Success/Error Snackbars */}
            <Snackbar
                open={submitSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity="success"
                    onClose={handleCloseSnackbar}
                    sx={{ width: '100%', fontSize: '1rem' }}
                >
                    User created successfully!
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!submitError}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity="error"
                    onClose={handleCloseSnackbar}
                    sx={{ width: '100%', fontSize: '1rem' }}
                >
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Form Submission Error
                        </Typography>
                        {submitError?.split('\n').map((line, index) => (
                            <Typography key={index} component="div" sx={{ display: 'block' }}>
                                {line}
                            </Typography>
                        ))}
                    </Box>
                </Alert>
            </Snackbar>
        </Container>
    );
};