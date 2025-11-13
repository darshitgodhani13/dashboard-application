import React from "react";
import { TextField, IconButton, Box, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

type Props = {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

const EditableCell: React.FC<Props> = ({ 
  value, 
  onSave, 
  placeholder = "Enter value...",
  multiline = false 
}) => {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setVal(value);
  }, [value]);

  const handleSave = () => {
    if (!val.trim()) {
      setError("Value cannot be empty");
      return;
    }
    onSave(val);
    setEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setVal(value);
    setEditing(false);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!editing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 40 }}>
        <Typography
          variant="body2" 
          sx={{ 
            flex: 1,
            wordBreak: 'break-word',
            opacity: value ? 1 : 0.5
          }}
        >
          {value || placeholder}
        </Typography>
        <Tooltip title="Edit">
          <IconButton 
            size="small" 
            onClick={() => setEditing(true)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
      <TextField
        size="small"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setError("");
        }}
        onKeyDown={handleKeyPress}
        error={!!error}
        helperText={error}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        fullWidth
        autoFocus
        placeholder={placeholder}
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Tooltip title="Save">
          <IconButton
            size="small"
            onClick={handleSave}
            color="primary"
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton
            size="small"
            onClick={handleCancel}
            color="inherit"
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default EditableCell;