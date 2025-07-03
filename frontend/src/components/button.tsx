
import {Button} from './ui/button';
export default function CustomButton({
    label,
    onClick,
    disabled = false,
    className = '',
    Variant = 'default'
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    Variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}) {
    return (
        <Button variant={Variant} onClick={onClick} disabled = {disabled} className={className}>{label}</Button>
    );
}